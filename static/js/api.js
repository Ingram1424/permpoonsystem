// Project Management System - Application Logic & State

// --- DATA STORE ---
// Load data from localStorage or fallback to default template project
const defaultProjectsData = {};

// --- SUPABASE CONFIG ---
const supabaseUrl = 'https://txglgkovojxvazbqxaac.supabase.co';
const supabaseKey = 'sb_publishable_XYSvmVEwASmhS9RpJMuz9Q_EbCZ8JJe';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Clean up large cached files in localStorage on startup to free up quota
try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("FILE:") || key.startsWith("SHARE:"))) {
            const val = localStorage.getItem(key);
            if (val && val.length > 5000) {
                keysToRemove.push(key);
            }
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    if (keysToRemove.length > 0) {
        console.log(`Cleaned up ${keysToRemove.length} large cached files from localStorage to restore quota.`);
    }
} catch (e) {
    console.warn("Failed to clean up localStorage:", e);
}

function removeBase64FromObject(obj) {
    if (!obj || typeof obj !== "object") return;
    for (const key in obj) {
        if (typeof obj[key] === "string" && obj[key].startsWith("data:") && obj[key].length > 5000) {
            obj[key] = "";
        } else if (typeof obj[key] === "object") {
            removeBase64FromObject(obj[key]);
        }
    }
}

let projectsData = {};
try {
    const savedData = localStorage.getItem("technical_water_projects_data_v2");
    if (savedData) {
        const parsed = JSON.parse(savedData);
        removeBase64FromObject(parsed);
        projectsData = {};
        Object.keys(parsed).forEach(k => {
            if (!k.startsWith("SHARE:") && !k.startsWith("FILE:")) {
                if (parsed[k]) {
                    parsed[k].code = k;
                    // Migration fallback: default undefined isSynced to true
                    if (parsed[k].isSynced === undefined) {
                        parsed[k].isSynced = true;
                    }
                }
                projectsData[k] = parsed[k];
            }
        });

    } else {
        projectsData = defaultProjectsData;
        localStorage.setItem("technical_water_projects_data_v2", JSON.stringify(projectsData));
    }
} catch (e) {
    console.error("Failed to load projectsData:", e);
    projectsData = defaultProjectsData;
}

// Background sync from Supabase
async function loadFromSupabase() {
    try {
        const { data, error } = await supabaseClient.from('projects').select('*').not('code', 'ilike', 'FILE:%').not('code', 'ilike', 'SHARE:%');
        if (error) throw error;
        
        if (data && data.length > 0) {
            const remoteData = {};
            data.forEach(row => {
                if (!row.code.startsWith("SHARE:") && !row.code.startsWith("FILE:")) {
                    if (row.data) {
                        row.data.code = row.code; // Force inner code to match database key
                        row.data.isSynced = true; // Mark as synced since it came from Supabase
                    }
                    remoteData[row.code] = row.data;
                }
            });
            removeBase64FromObject(remoteData);
            
            // Safety Guard: Compare timestamps and content sizes to prevent overwriting newer local data
            if (typeof projectsData === "object" && projectsData !== null) {
                const localProjectsToSync = [];
                
                Object.keys(projectsData).forEach(code => {
                    const localProj = projectsData[code];
                    const remoteProj = remoteData[code];
                    
                    const dbRow = data.find(r => r.code === code);
                    const remoteUpdatedAt = dbRow ? new Date(dbRow.updated_at).getTime() : 0;
                    const localUpdatedAt = localProj && localProj.updatedAt ? new Date(localProj.updatedAt).getTime() : 0;
                    
                    if (localProj && remoteProj) {
                        const localDocsLen = localProj.documents ? localProj.documents.length : 0;
                        const remoteDocsLen = remoteProj.documents ? remoteProj.documents.length : 0;
                        
                        const localTasksLen = localProj.tasks ? localProj.tasks.length : 0;
                        const remoteTasksLen = remoteProj.tasks ? remoteProj.tasks.length : 0;
                        
                        const localExpsLen = localProj.expenses ? localProj.expenses.length : 0;
                        const remoteExpsLen = remoteProj.expenses ? remoteProj.expenses.length : 0;

                        const localReportsLen = localProj.dailyReports ? localProj.dailyReports.length : 0;
                        const remoteReportsLen = remoteProj.dailyReports ? remoteProj.dailyReports.length : 0;

                        const localIsNewer = (localProj.isSynced === false) ||
                                             (localUpdatedAt > remoteUpdatedAt) || 
                                             (localDocsLen > remoteDocsLen) ||
                                             (localTasksLen > remoteTasksLen) ||
                                             (localExpsLen > remoteExpsLen) ||
                                             (localReportsLen > remoteReportsLen);
                                             
                        if (localIsNewer) {
                            console.warn(`Local project ${code} has newer changes (Local: ${new Date(localUpdatedAt).toISOString()}, Remote: ${dbRow ? dbRow.updated_at : 'none'}). Preserving local version.`);
                            remoteData[code] = localProj;
                            localProjectsToSync.push(code);
                        }
                    } else if (localProj && !remoteProj) {
                        if (localProj.isSynced) {
                            console.warn(`Local project ${code} was deleted on remote. Removing locally.`);
                            delete remoteData[code];
                        } else {
                            console.warn(`Local project ${code} is missing from remote. Preserving local.`);
                            remoteData[code] = localProj;
                            localProjectsToSync.push(code);
                        }
                    }
                });
                
                if (localProjectsToSync.length > 0) {
                    setTimeout(() => {
                        localProjectsToSync.forEach(code => {
                            if (typeof queueSyncActiveProject === "function") {
                                queueSyncActiveProject(code);
                            }
                        });
                    }, 1000);
                }
            }
            
            projectsData = remoteData;
            try {
                localStorage.setItem("technical_water_projects_data_v2", JSON.stringify(projectsData));
            } catch (e) {
                console.warn("LocalStorage quota exceeded during loadFromSupabase, attempting cache cleanup...", e);
                const cleaned = cleanLocalStorageQuota();
                if (cleaned) {
                    try {
                        localStorage.setItem("technical_water_projects_data_v2", JSON.stringify(projectsData));
                        console.log("LocalStorage save successful after cache cleanup.");
                    } catch (retryErr) {
                        console.error("LocalStorage write failed even after cleanup:", retryErr);
                    }
                } else {
                    console.error("LocalStorage write failed and no cleanup keys found:", e);
                }
            }
            
            // Re-populate dropdowns
            populateSubnavHospitals();
            const yearFilterEl = document.getElementById("subnav-year-filter");
            populateSubnavProjects(yearFilterEl ? yearFilterEl.value : "all");
            populateCostHospitals();
            populateCostProjects();
            
            // Re-render UI
            renderOverallDashboard();
            renderSubnavProjectWorkspace();
            if (typeof updateBellBadge === "function") {
                updateBellBadge();
            }
            if (typeof applyNotifRoleFilter === "function") {
                applyNotifRoleFilter(appState.currentRole);
            }
            console.log("Loaded data from Supabase successfully!");

            // One-off cleanup for PO 22026005032 media images
            if (projectsData["PO 22026005032"] && projectsData["PO 22026005032"].media && projectsData["PO 22026005032"].media.length > 0) {
                console.log("Cleaning up PO 22026005032 media...");
                projectsData["PO 22026005032"].media = [];
                localStorage.setItem("technical_water_projects_data_v2", JSON.stringify(projectsData));
                syncProjectToSupabase("PO 22026005032");
                supabaseClient.from('projects').delete().ilike('code', 'FILE:PO 22026005032:MEDIA:%')
                    .then(({ error }) => {
                        if (error) console.error("Error deleting remote files for PO 22026005032:", error);
                        else console.log("Successfully deleted remote files for PO 22026005032");
                    });
            }
        } else {
            console.log("Supabase is empty. Resetting local cache to empty...");
            projectsData = {};
            localStorage.setItem("technical_water_projects_data_v2", JSON.stringify(projectsData));
            
            populateSubnavHospitals();
            populateSubnavProjects("all");
            populateCostHospitals();
            populateCostProjects();
            
            renderOverallDashboard();
            renderSubnavProjectWorkspace();
        }

        // Sync signature roles and name history from Supabase
        try {
            const { data: rolesRes } = await supabaseClient.from('projects').select('data').eq('code', 'FILE:SIGNER_ROLES_HISTORY').single();
            if (rolesRes && rolesRes.data && rolesRes.data.roles) {
                appState.signerRolesHistory = rolesRes.data.roles;
                localStorage.setItem("technical_water_signer_roles_history", JSON.stringify(appState.signerRolesHistory));
            }
        } catch (e) {}

        try {
            const { data: namesRes } = await supabaseClient.from('projects').select('data').eq('code', 'FILE:SIGNER_NAMES_HISTORY').single();
            if (namesRes && namesRes.data && namesRes.data.history) {
                appState.signerNamesHistory = namesRes.data.history;
                localStorage.setItem("technical_water_signer_names_history", JSON.stringify(appState.signerNamesHistory));
                if (typeof window.updateSignerNamesDatalist === "function") window.updateSignerNamesDatalist();
            }
        } catch (e) {}

        // Sync customer accounts from Supabase
        try {
            const { data: accsRes } = await supabaseClient.from('projects').select('data').eq('code', 'FILE:CUSTOMER_ACCOUNTS_DATA').single();
            if (accsRes && accsRes.data) {
                if (accsRes.data.accounts) {
                    appState.customerAccounts = accsRes.data.accounts;
                    localStorage.setItem("technical_water_customer_accounts", JSON.stringify(appState.customerAccounts));
                }
                if (accsRes.data.staticUserOverrides) {
                    appState.staticUserOverrides = accsRes.data.staticUserOverrides;
                    localStorage.setItem("technical_water_static_user_overrides", JSON.stringify(appState.staticUserOverrides));
                }
                if (typeof window.renderCustomerAccountsTable === "function") {
                    window.renderCustomerAccountsTable();
                }
                if (typeof renderPermissionsManagement === "function") {
                    renderPermissionsManagement();
                }
            }
        } catch (e) {}

        // Sync user permissions from Supabase
        try {
            const { data: permsRes } = await supabaseClient.from('projects').select('data').eq('code', 'FILE:USER_PERMISSIONS_DATA').single();
            if (permsRes && permsRes.data && permsRes.data.permissions) {
                appState.userPermissions = permsRes.data.permissions;
                localStorage.setItem("technical_water_user_permissions", JSON.stringify(appState.userPermissions));
                if (typeof renderPermissionsManagement === "function") {
                    renderPermissionsManagement();
                }
            }
        } catch (e) {}
    } catch (e) {
        console.error("Failed to load from Supabase:", e);
    }
}

async function syncProjectToSupabase(code) {
    if (!code || !projectsData[code]) return;
    try {
        const { error } = await supabaseClient.from('projects').upsert({
            code: code,
            data: projectsData[code],
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
        console.log(`Synced project ${code} with Supabase`);
        // Mark as synced and save locally
        projectsData[code].isSynced = true;
        try {
            localStorage.setItem("technical_water_projects_data_v2", JSON.stringify(projectsData));
        } catch (e) {
            console.warn("LocalStorage quota exceeded during sync, attempting cache cleanup...", e);
            const cleaned = cleanLocalStorageQuota();
            if (cleaned) {
                try {
                    localStorage.setItem("technical_water_projects_data_v2", JSON.stringify(projectsData));
                    console.log("LocalStorage save successful after cache cleanup.");
                } catch (retryErr) {
                    console.error("LocalStorage write failed even after cleanup:", retryErr);
                }
            } else {
                console.error("LocalStorage write failed and no cleanup keys found:", e);
            }
        }
    } catch (e) {
        console.error(`Failed to sync project ${code} with Supabase:`, e);
        showToast(`บันทึกข้อมูลคลาวด์ล้มเหลว: ${e.message || e}`, "error");
        throw e;
    }
}

async function deleteProjectFromSupabase(code) {
    if (!code) return;
    try {
        const { error: err1 } = await supabaseClient.from('projects').delete().eq('code', code);
        if (err1) throw err1;
        console.log(`Deleted project ${code} from Supabase`);

        const { error: err2 } = await supabaseClient.from('projects').delete().ilike('code', `FILE:${code}:%`);
        if (err2) console.error(`Failed to delete files for ${code} from Supabase:`, err2);

        const { error: err3 } = await supabaseClient.from('projects').delete().ilike('code', `SHARE:${code}:%`);
        if (err3) console.error(`Failed to delete shares for ${code} from Supabase:`, err3);
    } catch (e) {
        console.error(`Failed to delete project ${code} from Supabase:`, e);
    }
}

function updateCloudSyncStatus(status) {
    const el = document.getElementById("cloud-sync-status");
    const icon = document.getElementById("cloud-sync-icon");
    const text = document.getElementById("cloud-sync-text");
    if (!el || !icon || !text) return;
    
    // Reset display opacity to keep it visible permanently
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    el.style.pointerEvents = "auto";
    
    if (status === "syncing") {
        el.style.backgroundColor = "rgba(245, 158, 11, 0.95)";
        el.style.color = "#ffffff";
        el.style.borderColor = "rgba(245, 158, 11, 0.2)";
        icon.className = "fa-solid fa-cloud-arrow-up fa-bounce";
        icon.style.color = "#ffffff";
        text.textContent = "กำลังบันทึกข้อมูลล่าสุดขึ้นคลาวด์...";
    } else if (status === "synced") {
        el.style.backgroundColor = "rgba(16, 185, 129, 0.95)";
        el.style.color = "#ffffff";
        el.style.borderColor = "rgba(16, 185, 129, 0.2)";
        icon.className = "fa-solid fa-circle-check";
        icon.style.color = "#ffffff";
        text.textContent = "บันทึกข้อมูลคลาวด์สำเร็จ";
    } else if (status === "error") {
        el.style.backgroundColor = "rgba(239, 68, 68, 0.95)";
        el.style.color = "#ffffff";
        el.style.borderColor = "rgba(239, 68, 68, 0.2)";
        icon.className = "fa-solid fa-triangle-exclamation";
        icon.style.color = "#ffffff";
        text.textContent = "การเชื่อมต่อขัดข้อง (บันทึกเฉพาะในเครื่อง)";
    }
}

let isSyncing = false;
const syncQueue = [];
const failedProjects = new Set();

// Warn user if they try to close/refresh tab during sync or with unsaved Gantt changes
window.addEventListener('beforeunload', (e) => {
    if (isSyncing || syncQueue.length > 0) {
        e.preventDefault();
        e.returnValue = 'ระบบกำลังบันทึกข้อมูลล่าสุดขึ้นคลาวด์ กรุณารอสักครู่ก่อนออกจากหน้าเว็บ';
        return e.returnValue;
    }
    if (window.ganttIsDirty) {
        e.preventDefault();
        e.returnValue = 'คุณมีข้อมูลแผนงาน (Plan Work) ที่ยังไม่ได้บันทึก หากออกจากหน้าเว็บข้อมูลล่าสุดจะสูญหาย';
        return e.returnValue;
    }
});

async function processSyncQueue() {
    if (isSyncing) return;
    if (syncQueue.length === 0) {
        if (failedProjects.size > 0) {
            updateCloudSyncStatus("error");
        } else {
            updateCloudSyncStatus("synced");
        }
        return;
    }
    
    isSyncing = true;
    updateCloudSyncStatus("syncing");
    const nextCode = syncQueue.shift();
    const startTime = Date.now();
    
    try {
        await syncProjectToSupabase(nextCode);
        failedProjects.delete(nextCode);
        
        // Satisfying UX: Ensure yellow state is visible for at least 600ms
        const elapsed = Date.now() - startTime;
        if (elapsed < 600) {
            await new Promise(resolve => setTimeout(resolve, 600 - elapsed));
        }
    } catch (e) {
        console.error("Queue sync error:", e);
        failedProjects.add(nextCode);
        updateCloudSyncStatus("error");
    } finally {
        isSyncing = false;
        processSyncQueue();
    }
}

function queueSyncActiveProject(code) {
    if (!code) return;
    
    updateCloudSyncStatus("syncing");
    // Collapse duplicates by moving them to the end of the queue
    const idx = syncQueue.indexOf(code);
    if (idx > -1) {
        syncQueue.splice(idx, 1);
    }
    syncQueue.push(code);
    processSyncQueue();
}

function syncActiveProject() {
    const activeCode = appState.selectedDetailProject;
    if (activeCode && activeCode !== "all") {
        queueSyncActiveProject(activeCode);
    }
    const costCode = appState.selectedCostProject;
    if (costCode && costCode !== "all" && costCode !== activeCode) {
        queueSyncActiveProject(costCode);
    }
}

async function syncAllProjectsToSupabase() {
    const codes = Object.keys(projectsData);
    for (const code of codes) {
        queueSyncActiveProject(code);
    }
}

function cleanLocalStorageQuota() {
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("FILE:") || key.startsWith("SHARE:"))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        console.log(`Cleaned up ${keysToRemove.length} cached files from localStorage to restore quota.`);
        return keysToRemove.length > 0;
    } catch (e) {
        console.warn("Failed to clean up localStorage:", e);
        return false;
    }
}

function saveToLocalStorage() {
    // Recalculate jobs and progress from tasks for all projects before saving
    Object.values(projectsData).forEach(p => recalculateJobsFromTasks(p));
    
    const activeProj = (appState.selectedDetailProject && appState.selectedDetailProject !== "all") ? projectsData[appState.selectedDetailProject] : null;
    if (activeProj) {
        calculatePlanScurveFromGantt(activeProj);
        let totalBudget = 0;
        if (activeProj.scurveData) {
            activeProj.scurveData.forEach(item => {
                if (!item.isSubtask) {
                    totalBudget += parseFloat(item.budget) || 0;
                }
            });
            activeProj.scurveData.forEach(item => {
                if (!item.isSubtask) {
                    item.weight = totalBudget > 0 ? (item.budget / totalBudget) * 100 : 0;
                } else {
                    item.weight = 0;
                }
            });
        }
    }
    // Set updatedAt timestamp locally to help resolve startup sync conflicts
    if (activeProj) {
        activeProj.updatedAt = new Date().toISOString();
        activeProj.isSynced = false;
    }
    const costProj = (appState.selectedCostProject && appState.selectedCostProject !== "all" && appState.selectedCostProject !== appState.selectedDetailProject) ? projectsData[appState.selectedCostProject] : null;
    if (costProj) {
        costProj.updatedAt = new Date().toISOString();
        costProj.isSynced = false;
    }
    try {
        localStorage.setItem("technical_water_projects_data_v2", JSON.stringify(projectsData));
    } catch (e) {
        console.warn("LocalStorage quota exceeded, attempting cache cleanup...", e);
        const cleaned = cleanLocalStorageQuota();
        if (cleaned) {
            try {
                localStorage.setItem("technical_water_projects_data_v2", JSON.stringify(projectsData));
                console.log("LocalStorage save successful after cache cleanup.");
            } catch (retryErr) {
                console.error("LocalStorage write failed even after cleanup:", retryErr);
            }
        } else {
            console.error("LocalStorage write failed and no cleanup keys found:", e);
        }
    }
    // Always sync to Supabase even if localStorage quota is exceeded!
    syncActiveProject();
}

// Disabled Realtime updates to prevent sync race conditions during rapid editing

// Load from Supabase on startup if NOT on login page
if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
    loadFromSupabase();
}

window.isProjectAllowedForCustomer = function(p, perms) {
    if (!p || !perms) return false;
    const allowedH = perms.hospitals || [];
    const allowedP = perms.projects || [];
    
    // Direct match in allowedP
    if (allowedP.includes(p.code)) return true;

    // Check if hospital is allowed
    if (allowedH.includes(p.customer)) {
        // If Admin explicitly selected specific projects for this hospital, ONLY allow those in allowedP!
        const hospitalProjectsInP = allowedP.filter(code => projectsData[code] && projectsData[code].customer === p.customer);
        if (hospitalProjectsInP.length > 0) {
            return allowedP.includes(p.code);
        }
        return true;
    }
    
    return false;
};

function populateSubnavHospitals() {
    const selector = document.getElementById("subnav-hospital-selector");
    if (!selector) return;
    
    let currentHospital = "";
    if (selector.value) {
        currentHospital = selector.value;
    } else {
        const proj = projectsData[appState.selectedDetailProject];
        if (proj) currentHospital = proj.customer;
    }
    
    selector.innerHTML = "";

    const allHospitals = [
        "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
        "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
        "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4",
        "อื่นๆ"
    ];

    // For customer/pe/tech role: filter to allowed hospitals only
    let hospitals = allHospitals;
    if (appState.currentRole === "customer" || appState.currentRole === "pe" || appState.currentRole === "technician" || appState.currentRole === "tech") {
        const cUserKey = appState.currentCustomerUser || "user1";
        const perms = appState.userPermissions[cUserKey] || { hospitals: [], projects: [] };
        const effectiveHospitals = Object.values(projectsData)
            .filter(p => isProjectAllowedForCustomer(p, perms))
            .map(p => p.customer);
        const effectiveH = [...new Set(effectiveHospitals)];
        hospitals = allHospitals.filter(h => effectiveH.includes(h));
        const allOpt = document.createElement("option");
        allOpt.value = "all";
        allOpt.textContent = "ทั้งหมดทุกโรงพยาบาลที่ได้รับสิทธิ์";
        selector.appendChild(allOpt);
    } else {
        // Add "All Hospitals" option for non-customer roles
        const allOpt = document.createElement("option");
        allOpt.value = "all";
        allOpt.textContent = "ทั้งหมดทุกโรงพยาบาล";
        selector.appendChild(allOpt);
    }
    
    hospitals.forEach(h => {
        const opt = document.createElement("option");
        opt.value = h;
        opt.textContent = h;
        selector.appendChild(opt);
    });
    
    if (currentHospital && (currentHospital === "all" || hospitals.includes(currentHospital))) {
        selector.value = currentHospital;
    } else {
        selector.value = "all";
    }
}

function populateSubnavProjects(yearFilter) {
    const hospitalSelector = document.getElementById("subnav-hospital-selector");
    const projectSelector = document.getElementById("subnav-project-selector");
    if (!hospitalSelector || !projectSelector) return;
    
    const selectedHospital = hospitalSelector.value;
    projectSelector.innerHTML = "";
    
    const standardHospitals = [
        "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
        "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
        "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4"
    ];
    
    // Filter projects based on hospital and year
    let projects = Object.values(projectsData).filter(p => {
        let hospitalMatch = false;
        if (selectedHospital === "all") {
            hospitalMatch = true;
        } else if (selectedHospital === "อื่นๆ") {
            hospitalMatch = !standardHospitals.includes(p.customer);
        } else {
            hospitalMatch = p.customer === selectedHospital;
        }
        const yearMatch = yearFilter === "all" || p.year === parseInt(yearFilter);
        const isQuotingTab = appState.currentView === "quoting-projects-list";
        const isQuotingStatus = (p.status === "งานที่กำลังเสนอราคา" || p.status === "กำลังเสนอราคา" || p.status === "งานที่รอเสนอราคา");
        const quotingMatch = isQuotingTab ? isQuotingStatus : !isQuotingStatus;
        return hospitalMatch && yearMatch && quotingMatch;
    });

    // For customer/pe/tech role: further filter strictly by permissions
    if (appState.currentRole === "customer" || appState.currentRole === "pe" || appState.currentRole === "technician" || appState.currentRole === "tech") {
        const cUserKey = appState.currentCustomerUser || "user1";
        const perms = appState.userPermissions[cUserKey] || { hospitals: [], projects: [] };
        projects = projects.filter(p => isProjectAllowedForCustomer(p, perms));
    }
    
    if (projects.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = appState.currentView === "quoting-projects-list" ? "-- ไม่มีรายการเสนอราคา --" : "-- ไม่มีโครงการ --";
        projectSelector.appendChild(opt);
        return;
    }
    
    // Add "All Projects" option
    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = appState.currentView === "quoting-projects-list" ? "ทั้งหมดทุกรายการเสนอราคา" : "ทั้งหมดทุกโครงการ";
    projectSelector.appendChild(allOpt);

    projects.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.code;
        opt.textContent = `${p.code} : ${p.name.replace(/ \(\d{4}\)$/, '')} (${p.customer.replace('โรงพยาบาล', 'รพ.')})`;
        projectSelector.appendChild(opt);
    });
    
    const activeCode = appState.selectedDetailProject;
    if (activeCode && [...projectSelector.options].some(opt => opt.value === activeCode)) {
        projectSelector.value = activeCode;
    } else {
        // Default to "all" when switching hospital (index 0) — never auto-pick first project
        projectSelector.selectedIndex = 0;
        appState.selectedDetailProject = projectSelector.value;
        sessionStorage.setItem("technical_water_last_detail_project", appState.selectedDetailProject);
    }
}

function updateSelectedDetailProject() {
    const projectSelector = document.getElementById("subnav-project-selector");
    if (!projectSelector || !projectSelector.value) return;
    
    appState.selectedDetailProject = projectSelector.value;
    sessionStorage.setItem("technical_water_last_detail_project", appState.selectedDetailProject);
}

function updateSelectedCostProject(code) {
    appState.selectedCostProject = code;
    sessionStorage.setItem("technical_water_last_cost_project", code);
}

function populateDashboardKpiProjects() {
    const hospitalSelect = document.getElementById("kpi-filter-hospital");
    const projectSelect = document.getElementById("kpi-filter-project");
    if (!hospitalSelect || !projectSelect) return;
    
    const hospitalVal = hospitalSelect.value;
    const yearAVal = appState.selectedYearFilterA || "2025";
    const yearBVal = appState.selectedYearFilterB || "2026";
    
    const projectsA = yearAVal === "all"
        ? Object.values(projectsData)
        : Object.values(projectsData).filter(p => p.year.toString() === yearAVal);
    const projectsB = yearBVal === "all"
        ? Object.values(projectsData)
        : Object.values(projectsData).filter(p => p.year.toString() === yearBVal);
        
    const combinedProjectsMap = {};
    projectsA.forEach(p => { combinedProjectsMap[p.code] = p; });
    projectsB.forEach(p => { combinedProjectsMap[p.code] = p; });
    const combinedProjects = Object.values(combinedProjectsMap);
    
    let filtered = combinedProjects;
    if (hospitalVal !== "all") {
        const standardHospitals = [
            "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
            "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
            "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4"
        ];
        if (hospitalVal === "อื่นๆ") {
            filtered = filtered.filter(p => !standardHospitals.includes(p.customer));
        } else {
            filtered = filtered.filter(p => p.customer === hospitalVal);
        }
    }
    
    const currentVal = projectSelect.value;
    
    projectSelect.innerHTML = '<option value="all">ทั้งหมดทุกโครงการ</option>';
    
    filtered.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.code;
        opt.textContent = `${p.code} : ${p.name.replace(/ \(\d{4}\)$/, '')}`;
        projectSelect.appendChild(opt);
    });
    
    if ([...projectSelect.options].some(opt => opt.value === currentVal)) {
        projectSelect.value = currentVal;
    } else {
        projectSelect.value = "all";
    }
}

function updateDashboardProgressAndFinancials() {
    const hospitalSelect = document.getElementById("kpi-filter-hospital");
    const projectSelect = document.getElementById("kpi-filter-project");
    if (!hospitalSelect || !projectSelect) return;
    
    const hospitalVal = hospitalSelect.value;
    const projectVal = projectSelect.value;
    
    const yearAVal = appState.selectedYearFilterA || "2025";
    const yearBVal = appState.selectedYearFilterB || "2026";
    
    const projectsA = yearAVal === "all"
        ? Object.values(projectsData)
        : Object.values(projectsData).filter(p => p.year.toString() === yearAVal);
    const projectsB = yearBVal === "all"
        ? Object.values(projectsData)
        : Object.values(projectsData).filter(p => p.year.toString() === yearBVal);
        
    const combinedProjectsMap = {};
    projectsA.forEach(p => { combinedProjectsMap[p.code] = p; });
    projectsB.forEach(p => { combinedProjectsMap[p.code] = p; });
    const combinedProjects = Object.values(combinedProjectsMap);
    
    let filtered = combinedProjects;
    if (hospitalVal !== "all") {
        const standardHospitals = [
            "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
            "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
            "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4"
        ];
        if (hospitalVal === "อื่นๆ") {
            filtered = filtered.filter(p => !standardHospitals.includes(p.customer));
        } else {
            filtered = filtered.filter(p => p.customer === hospitalVal);
        }
    }
    if (projectVal !== "all") {
        filtered = filtered.filter(p => p.code === projectVal);
    }
    
    let plannedProg = 0;
    let actualProg = 0;
    let costSum = 0;
    let profitSum = 0;
    
    filtered.forEach(p => {
        plannedProg += p.plannedProgress || 0;
        actualProg += p.progress || 0;
        costSum += p.cost || 0;
        profitSum += p.profit || 0;
    });
    
    const count = filtered.length;
    if (count > 0) {
        plannedProg = Math.round(plannedProg / count);
        actualProg = Math.round(actualProg / count);
    } else {
        plannedProg = 0;
        actualProg = 0;
    }
    
    document.getElementById("prog-planned-text").textContent = `${plannedProg}%`;
    document.getElementById("prog-planned-bar").style.width = `${plannedProg}%`;
    document.getElementById("prog-actual-text").textContent = `${actualProg}%`;
    document.getElementById("prog-actual-bar").style.width = `${actualProg}%`;
    
    document.getElementById("fin-cost-summary").textContent = formatNumber(costSum);
    document.getElementById("fin-profit-summary").textContent = formatNumber(profitSum);
    document.getElementById("fin-netprofit-summary").textContent = formatNumber(profitSum);
    
    const lossEl = document.getElementById("fin-loss-summary");
    if (lossEl) {
        if (profitSum < 0) {
            lossEl.textContent = formatNumber(Math.abs(profitSum));
            lossEl.className = "fin-val text-red";
        } else {
            lossEl.textContent = "-";
            lossEl.className = "fin-val text-muted";
        }
    }
}

function renderOverallDashboard() {
    if (!document.getElementById("kpi-total-jobs")) return;
    const yearAVal = appState.selectedYearFilterA || "2025";
    const yearBVal = appState.selectedYearFilterB || "2026";
    
    // Always recalculate jobs from tasks first (single source of truth, fixes stale data)
    Object.values(projectsData).forEach(p => recalculateJobsFromTasks(p));
    
    // Active projects for Year A and Year B
    const projectsA = yearAVal === "all"
        ? Object.values(projectsData)
        : Object.values(projectsData).filter(p => p.year.toString() === yearAVal);
    const projectsB = yearBVal === "all"
        ? Object.values(projectsData)
        : Object.values(projectsData).filter(p => p.year.toString() === yearBVal);
    
    // For KPIs and general metrics, we show the combined sum of both selected years (unique by code)!
    const combinedProjectsMap = {};
    projectsA.forEach(p => { combinedProjectsMap[p.code] = p; });
    projectsB.forEach(p => { combinedProjectsMap[p.code] = p; });
    const combinedProjects = Object.values(combinedProjectsMap);
    
    let totalJobs = combinedProjects.length;
    let inprogressJobs = 0;
    let finishedJobs = 0;
    let completedJobs = 0;
    let pendingApprovalJobs = 0;
    
    combinedProjects.forEach(p => {
        // Count projects by status
        if (p.status === "งานที่ดำเนินการเสร็จแล้ว" || p.status === "เสร็จสิ้น") {
            finishedJobs++;
        } else if (p.status === "เสร็จแล้ว" || p.status === "งานเสร็จแล้วรอส่งงาน" || p.status === "งานเสร็จแล้วรอส่งงาน/อนุมัติ") {
            completedJobs++;
        } else if (p.status === "รออนุมัติ" || p.status === "งานรออนุมัติ" || p.status === "งานที่รอเสนอราคา" || p.status === "งานที่กำลังเสนอราคา" || p.status === "กำลังเสนอราคา") {
            pendingApprovalJobs++;
        } else {
            inprogressJobs++;
        }
    });
    
    // Bind KPI values
    document.getElementById("kpi-total-jobs").textContent = totalJobs;
    document.getElementById("kpi-inprogress-jobs").textContent = inprogressJobs;
    if (document.getElementById("kpi-finished-jobs")) {
        document.getElementById("kpi-finished-jobs").textContent = finishedJobs;
    }
    document.getElementById("kpi-completed-jobs").textContent = completedJobs;
    document.getElementById("kpi-pending-approval-jobs").textContent = pendingApprovalJobs;
    document.getElementById("kpi-total-branches").textContent = 12; // Always show total branches (12)
    
    // Render Bottom Hospital Cards Grid (Show all projects that are not completed across all years)
    const gridProjects = Object.values(projectsData).filter(p => 
        p.status !== "งานที่ดำเนินการเสร็จแล้ว" && p.status !== "เสร็จสิ้น" && (p.progress === undefined || p.progress === null || isNaN(p.progress) || p.progress < 100)
    );
    renderHospitalsGrid(gridProjects);
    
    // Prepare bar chart data for all hospitals
    const hospitalsList = [
        "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
        "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
        "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4",
        "อื่นๆ"
    ];
    
    const inprogressCounts = Array(hospitalsList.length).fill(0);
    const finishedCounts = Array(hospitalsList.length).fill(0);
    const completedCounts = Array(hospitalsList.length).fill(0);
    const pendingApprovalCounts = Array(hospitalsList.length).fill(0);
    
    combinedProjects.forEach(p => {
        let idx = hospitalsList.indexOf(p.customer);
        if (idx === -1) {
            idx = hospitalsList.indexOf("อื่นๆ");
        }
        if (idx === -1) return;
        
        if (p.status === "งานที่ดำเนินการเสร็จแล้ว" || p.status === "เสร็จสิ้น") {
            finishedCounts[idx]++;
        } else if (p.status === "เสร็จแล้ว" || p.status === "งานเสร็จแล้วรอส่งงาน" || p.status === "งานเสร็จแล้วรอส่งงาน/อนุมัติ") {
            completedCounts[idx]++;
        } else if (p.status === "รออนุมัติ" || p.status === "งานรออนุมัติ" || p.status === "งานที่รอเสนอราคา" || p.status === "งานที่กำลังเสนอราคา" || p.status === "กำลังเสนอราคา") {
            pendingApprovalCounts[idx]++;
        } else {
            inprogressCounts[idx]++;
        }
    });
    
    renderOverallBarChart(hospitalsList, inprogressCounts, finishedCounts, completedCounts, pendingApprovalCounts);
    renderOverallDonutChart(inprogressJobs, finishedJobs, completedJobs, pendingApprovalJobs);
    
    // Populate dropdowns & update progress/financials
    populateDashboardKpiProjects();
    updateDashboardProgressAndFinancials();
}

function renderOverallBarChart(labels, inprogress, finished, completed, pendingApproval) {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }
    try {
        const ctx = document.getElementById('overallBarChart').getContext('2d');
        
        if (overallBarChart) {
            overallBarChart.destroy();
        }
        
        const datasets = [
            {
                label: 'งานที่กำลังดำเนินการ',
                data: inprogress,
                backgroundColor: '#059669', // Green (matches KPI card)
                borderRadius: 4
            },
            {
                label: 'งานที่ดำเนินการเสร็จแล้ว',
                data: finished,
                backgroundColor: '#8b5cf6', // Purple (matches KPI card)
                borderRadius: 4
            },
            {
                label: 'งานเสร็จแล้วรอส่งงาน/อนุมัติ',
                data: completed,
                backgroundColor: '#0284c7', // Teal (matches KPI card)
                borderRadius: 4
            },
            {
                label: 'งานที่รอเสนอราคา',
                data: pendingApproval,
                backgroundColor: '#f59e0b', // Amber/Orange (matches KPI card)
                borderRadius: 4
            }
        ];
            
        overallBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                indexAxis: 'y', // Horizontal Bar Chart
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { family: 'Prompt', size: 10 } }
                    },
                    tooltip: {
                        titleFont: { family: 'Prompt' },
                        bodyFont: { family: 'Prompt' }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { font: { family: 'Prompt' }, precision: 0 }
                    },
                    y: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { 
                            font: { family: 'Prompt', size: 10 },
                            autoSkip: false
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Failed to render overall bar chart:", e);
    }
}

function populateCostHospitals() {
    const selector = document.getElementById("cost-detail-hospital-selector");
    if (!selector) return;
    
    let currentHospital = "";
    if (selector.value) {
        currentHospital = selector.value;
    } else {
        const proj = projectsData[appState.selectedCostProject];
        if (proj) currentHospital = proj.customer;
    }
    
    selector.innerHTML = "";
    
    // Add "All Hospitals" option
    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = "ทั้งหมดทุกโรงพยาบาล";
    selector.appendChild(allOpt);

    const hospitals = [
        "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
        "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
        "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4",
        "อื่นๆ"
    ];
    
    hospitals.forEach(h => {
        const opt = document.createElement("option");
        opt.value = h;
        opt.textContent = h;
        selector.appendChild(opt);
    });
    
    if (currentHospital && (currentHospital === "all" || hospitals.includes(currentHospital))) {
        selector.value = currentHospital;
    } else {
        selector.selectedIndex = 0;
    }
}

function populateCostProjects() {
    const yearFilter = document.getElementById("cost-detail-year-filter");
    const hospitalSelector = document.getElementById("cost-detail-hospital-selector");
    const projectSelector = document.getElementById("cost-project-selector");
    if (!yearFilter || !hospitalSelector || !projectSelector) return;
    
    const yearVal = yearFilter.value;
    const selectedHospital = hospitalSelector.value;
    
    projectSelector.innerHTML = "";
    
    const standardHospitals = [
        "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
        "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
        "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4"
    ];
    
    const projects = Object.values(projectsData).filter(p => {
        let hospitalMatch = false;
        if (selectedHospital === "all") {
            hospitalMatch = true;
        } else if (selectedHospital === "อื่นๆ") {
            hospitalMatch = !standardHospitals.includes(p.customer);
        } else {
            hospitalMatch = p.customer === selectedHospital;
        }
        const yearMatch = yearVal === "all" || p.year === parseInt(yearVal);
        return hospitalMatch && yearMatch;
    });
    
    if (projects.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "-- ไม่มีโครงการ --";
        projectSelector.appendChild(opt);
        appState.selectedCostProject = "";
        return;
    }
    
    // Add "All Projects" option
    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = "ทั้งหมดทุกโครงการ";
    projectSelector.appendChild(allOpt);

    projects.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.code;
        opt.textContent = `${p.code} : ${p.name.replace(/ \(\d{4}\)$/, '')} (${p.customer.replace('โรงพยาบาล', 'รพ.')})`;
        projectSelector.appendChild(opt);
    });
    
    const activeCode = appState.selectedCostProject;
    if (activeCode === "all" || [...projectSelector.options].some(opt => opt.value === activeCode)) {
        projectSelector.value = activeCode;
    } else {
        projectSelector.selectedIndex = 0;
        appState.selectedCostProject = projectSelector.value;
    }
}

// --- GANTT DIRTY TRACKER ---
window.ganttIsDirty = false;

// --- APP STATE ---
const appState = {
    currentView: "dashboard",
    currentRole: "pm", // pm, accounting, customer
    selectedProjectFilter: "all", // all or specific PRJ code
    selectedDetailProject: "all",
    selectedCostProject: sessionStorage.getItem("technical_water_last_cost_project") || Object.keys(projectsData)[0] || "",
    selectedDocFilter: "all",
    activeProjectTab: "general-info",
    selectedGalleryFolder: null,
    selectedYearFilterA: "2025",
    selectedYearFilterB: "2026",
    selectedCostYearFilter: "all",
    projectCostCurrentPage: 1,
    activeDailyReportFilter: "all",
    currentCustomerUser: localStorage.getItem("technical_water_current_customer_user") || "user1",
    userPermissions: null, // Loaded below
    customerAccounts: null, // Loaded below
    signerRolesHistory: ["Chief Engineer", "Supervisor", "Admin"],
    signerNamesHistory: []
};

try {
    const rawRoles = localStorage.getItem("technical_water_signer_roles_history");
    if (rawRoles) appState.signerRolesHistory = JSON.parse(rawRoles);
} catch (e) {}

try {
    const rawNames = localStorage.getItem("technical_water_signer_names_history");
    if (rawNames) appState.signerNamesHistory = JSON.parse(rawNames);
} catch (e) {}

window.updateSignerNamesDatalist = function() {
    let dl = document.getElementById("signer-names-datalist");
    if (!dl) {
        dl = document.createElement("datalist");
        dl.id = "signer-names-datalist";
        document.body.appendChild(dl);
    }
    dl.innerHTML = "";
    (appState.signerNamesHistory || []).forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        dl.appendChild(opt);
    });
};

// Initialize name datalist immediately on script load
window.updateSignerNamesDatalist();

window.initSignerRoleDropdown = function(selectEl, selectedValue) {
    if (!selectEl) return;
    
    const populate = (val) => {
        selectEl.innerHTML = "";
        
        const placeholderOpt = document.createElement("option");
        placeholderOpt.value = "";
        placeholderOpt.textContent = "-- เลือกตำแหน่ง --";
        placeholderOpt.disabled = true;
        placeholderOpt.selected = !val;
        selectEl.appendChild(placeholderOpt);

        const roles = appState.signerRolesHistory || ["Chief Engineer", "Supervisor", "Admin"];
        roles.forEach(role => {
            const opt = document.createElement("option");
            opt.value = role;
            opt.textContent = role;
            if (role === val) opt.selected = true;
            selectEl.appendChild(opt);
        });

        const addOpt = document.createElement("option");
        addOpt.value = "__ADD_NEW_ROLE__";
        addOpt.textContent = "➕ เพิ่มตำแหน่งใหม่...";
        selectEl.appendChild(addOpt);
    };

    populate(selectedValue);

    selectEl.addEventListener("change", function() {
        if (this.value === "__ADD_NEW_ROLE__") {
            const newRole = prompt("กรอกตำแหน่ง/บทบาทใหม่ที่ต้องการเพิ่ม:");
            if (newRole && newRole.trim()) {
                const roleTrimmed = newRole.trim();
                if (!appState.signerRolesHistory.includes(roleTrimmed)) {
                    appState.signerRolesHistory.push(roleTrimmed);
                    localStorage.setItem("technical_water_signer_roles_history", JSON.stringify(appState.signerRolesHistory));
                    if (typeof supabaseClient !== "undefined") {
                        supabaseClient.from('projects').upsert({
                            code: 'FILE:SIGNER_ROLES_HISTORY',
                            data: { roles: appState.signerRolesHistory }
                        }).catch(err => console.error(err));
                    }
                }
                // Refresh all role dropdowns on screen
                document.querySelectorAll(".signer-role-select").forEach(sel => {
                    const currentVal = (sel === selectEl) ? roleTrimmed : sel.value;
                    window.initSignerRoleDropdown(sel, currentVal);
                });
            } else {
                this.value = "";
            }
        }
    });
};

// Define default customer user accounts with Username & Password
const defaultCustomerAccounts = {
    user1: { name: "Customer 1 : BKK Hospital Representative", username: "cust_bkk", password: "BkkPass2026", userKey: "user1" },
    user2: { name: "Customer 2 : Paolo Representative", username: "cust_paolo", password: "PaoloPass2026", userKey: "user2" },
    user3: { name: "Customer 3 : Phyathai Representative", username: "cust_phyathai", password: "PhyathaiPass2026", userKey: "user3" }
};

try {
    const rawAcc = localStorage.getItem("technical_water_customer_accounts");
    appState.customerAccounts = rawAcc ? JSON.parse(rawAcc) : defaultCustomerAccounts;
} catch (e) {
    appState.customerAccounts = defaultCustomerAccounts;
}
try {
    const rawOverrides = localStorage.getItem("technical_water_static_user_overrides");
    appState.staticUserOverrides = rawOverrides ? JSON.parse(rawOverrides) : {};
} catch (e) {
    appState.staticUserOverrides = {};
}

window.saveCustomerAccounts = async function() {
    localStorage.setItem("technical_water_customer_accounts", JSON.stringify(appState.customerAccounts));
    localStorage.setItem("technical_water_static_user_overrides", JSON.stringify(appState.staticUserOverrides || {}));
    if (typeof supabaseClient !== "undefined") {
        try {
            await supabaseClient.from('projects').upsert({
                code: 'FILE:CUSTOMER_ACCOUNTS_DATA',
                data: { 
                    accounts: appState.customerAccounts,
                    staticUserOverrides: appState.staticUserOverrides || {}
                }
            });
        } catch (err) {
            console.error("Failed to sync customer accounts to Supabase:", err);
        }
    }
};

window.saveUserPermissions = async function() {
    localStorage.setItem("technical_water_user_permissions", JSON.stringify(appState.userPermissions));
    if (typeof supabaseClient !== "undefined") {
        try {
            await supabaseClient.from('projects').upsert({
                code: 'FILE:USER_PERMISSIONS_DATA',
                data: { permissions: appState.userPermissions }
            });
        } catch (err) {
            console.error("Failed to sync user permissions to Supabase:", err);
        }
    }
};

// Define default permissions mapping
const defaultPermissions = {
    user1: {
        hospitals: ["โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3"],
        projects: []
    },
    user2: {
        hospitals: ["โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4"],
        projects: []
    },
    user3: {
        hospitals: [],
        projects: [Object.keys(projectsData)[0] || "PO 22026005032"]
    }
};

try {
    const raw = localStorage.getItem("technical_water_user_permissions");
    appState.userPermissions = raw ? JSON.parse(raw) : defaultPermissions;
} catch (e) {
    appState.userPermissions = defaultPermissions;
}

// --- CHART INSTANCES ---
let overallBarChart = null;
let overallDonutChart = null;
let detailProjectBarChart = null;
let detailProjectDonutChart = null;
let subtabCostStructureDonut = null;
let costStructureDonut = null;
let projectYearlyComparisonChart = null;
let costOverallBarChart = null;
let costOverallDonutChart = null;
let scurveChartInstance = null;

// --- FORMATTERS ---
function formatNumber(num) {
    if (num === 0 || isNaN(num) || num === null) return "-";
    return new Intl.NumberFormat('th-TH').format(num);
}

// --- FILE HELPER: Convert uploaded file to Base64 Data URL (persistent across refreshes) ---
function readFileAsBase64(file) {
    return new Promise((resolve) => {
        if (!file) { resolve({ name: "", dataUrl: "" }); return; }
        
        // Auto-compress image files to 1200px width at 70% quality to prevent LocalStorage QuotaExceededError
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 1200;
                    
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve({ name: file.name, dataUrl: compressedDataUrl });
                };
                img.onerror = () => {
                    // Fallback if image fails to load in canvas
                    const rawReader = new FileReader();
                    rawReader.onload = (ev) => resolve({ name: file.name, dataUrl: ev.target.result });
                    rawReader.readAsDataURL(file);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            // Non-image files (PDFs, Excels...) read raw
            const reader = new FileReader();
            reader.onload = (e) => resolve({ name: file.name, dataUrl: e.target.result });
            reader.onerror = () => resolve({ name: file.name, dataUrl: "" });
            reader.readAsDataURL(file);
        }
    });
}

// Helper function for rendering prominent status badges
window.getStatusBadgeHTML = function(status) {
    const st = status || "งานที่กำลังดำเนินการ";
    if (st.includes("เสนอราคา")) {
        return `<span style="font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #e0e7ff; color: #3730a3; border: 1.5px solid #a5b4fc; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);"><i class="fa-solid fa-file-invoice"></i> ${st}</span>`;
    } else if (st.includes("ส่งงาน") || st.includes("เสร็จแล้ว")) {
        return `<span style="font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #e0f2fe; color: #0369a1; border: 1.5px solid #7dd3fc; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);"><i class="fa-solid fa-circle-check"></i> ${st}</span>`;
    } else if (st.includes("อนุมัติ")) {
        return `<span style="font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #fef3c7; color: #b45309; border: 1.5px solid #fde68a; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);"><i class="fa-solid fa-clock-rotate-left"></i> ${st}</span>`;
    } else if (st.includes("ดำเนินการเสร็จแล้ว")) {
        return `<span style="font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #f3e8ff; color: #8b5cf6; border: 1.5px solid #d8b4fe; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);"><i class="fa-solid fa-circle-check"></i> ${st}</span>`;
    } else {
        // งานที่กำลังดำเนินการ - Flashing / Pulsing animation badge!
        return `<span class="status-badge-inprogress" style="font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #dcfce7; color: #15803d; border: 1.5px solid #86efac; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-circle-play status-icon-blink" style="color: #16a34a;"></i> ${st}</span>`;
    }
};

// --- JOBS HELPER: Recalculate jobs counts and work breakdown from tasks array (single source of truth) ---
function recalculateJobsFromTasks(project) {
    if (!project) return;
    if (!project.tasks) {
        project.tasks = [];
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let total = project.tasks.length;
    let completed = 0;
    let delayed = 0;
    let inprogress = 0;
    
    // Initialize categorized counts for workBreakdown
    const wbInprogress = [0, 0, 0, 0, 0, 0];
    const wbCompleted = [0, 0, 0, 0, 0, 0];
    const wbDelayed = [0, 0, 0, 0, 0, 0];

    project.tasks.forEach(t => {
        // Categorize based on keywords in title
        const title = (t.title || "").toLowerCase();
        let catIdx = 5; // Others
        if (title.includes("ไฟ") || title.includes("control") || title.includes("power") || title.includes("electrical") || title.includes("cable") || title.includes("wiring") || title.includes("rmu")) {
            catIdx = 0; // Electrical
        } else if (title.includes("แอร์") || title.includes("hvac") || title.includes("cool") || title.includes("air") || title.includes("duct") || title.includes("ระบายอากาศ")) {
            catIdx = 1; // HVAC
        } else if (title.includes("น้ำ") || title.includes("สุขาภิบาล") || title.includes("pipe") || title.includes("plumbing") || title.includes("sanitation") || title.includes("drain")) {
            catIdx = 2; // Sanitation
        } else if (title.includes("โครงสร้าง") || title.includes("foundation") || title.includes("beam") || title.includes("structure") || title.includes("เสา")) {
            catIdx = 3; // Structure
        } else if (title.includes("สถาปัตย์") || title.includes("paint") || title.includes("wall") || title.includes("floor") || title.includes("tile") || title.includes("architecture") || title.includes("ตกแต่ง")) {
            catIdx = 4; // Architecture
        }

        if (t.progress >= 100) {
            completed++;
            wbCompleted[catIdx]++;
        } else {
            // Parse end date dd/mm/yyyy
            const parts = (t.end || "").split("/");
            let isDelayed = false;
            if (parts.length === 3) {
                const endDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                if (!isNaN(endDate) && endDate < today) {
                    isDelayed = true;
                }
            }
            if (isDelayed) {
                delayed++;
                wbDelayed[catIdx]++;
            } else {
                inprogress++;
                wbInprogress[catIdx]++;
            }
        }
    });

    project.jobs = { total, completed, delayed, inprogress };
    
    // Update workBreakdown
    project.workBreakdown = {
        inprogress: wbInprogress,
        completed: wbCompleted,
        delayed: wbDelayed
    };

    // Calculate S-Curve cumulative actual progress if it exists
    let scurveProgress = null;
    if (project.scurveData && project.scurveData.length > 0 && project.scurveMonths && project.scurveMonths.length > 0) {
        let totalBudget = 0;
        project.scurveData.forEach(item => {
            if (!item.isSubtask) {
                totalBudget += parseFloat(item.budget) || 0;
            }
        });
        
        let parentWeights = [];
        project.scurveData.forEach((item) => {
            if (!item.isSubtask) {
                const w = totalBudget > 0 ? (item.budget / totalBudget) * 100 : 0;
                parentWeights.push(w);
            } else {
                parentWeights.push(0);
            }
        });

        let actualWeeklySums = new Array(project.scurveMonths.length * 4).fill(0);
        let currentParentWeight = 0;
        project.scurveData.forEach((item, idx) => {
            if (!item.isSubtask) {
                currentParentWeight = parentWeights[idx];
            }
            for (let i = 0; i < actualWeeklySums.length; i++) {
                let aVal = (item.actual && item.actual[i] !== undefined && item.actual[i] !== null && item.actual[i] !== '') ? (parseFloat(item.actual[i]) || 0) : 0;
                actualWeeklySums[i] += (currentParentWeight * aVal / 100);
            }
        });

        let overall = 0;
        actualWeeklySums.forEach(val => {
            overall += val;
        });
        scurveProgress = Math.min(100, Math.round(overall));
    }

    if (scurveProgress !== null) {
        project.progress = scurveProgress;
    } else if (total > 0) {
        const sumVal = project.tasks.reduce((s, t) => {
            const val = parseFloat(t.progress);
            return s + (isNaN(val) ? 0 : val);
        }, 0);
        project.progress = Math.round(sumVal / total);
    } else {
        if (project.progress === undefined || project.progress === null) {
            project.progress = 0;
        }
    }
    
    // Auto-update status to completed if progress is 100%
    if (project.progress === 100) {
        const cur = project.status || "";
        if (cur === "งานที่กำลังดำเนินการ" || cur === "กำลังดำเนินการ" || cur === "กำลังเสนอราคา" || !cur) {
            project.status = "งานที่ดำเนินการเสร็จแล้ว";
            // Sync this project back to Supabase if we are online and this is a real project code
            if (project.code && !project.code.startsWith("SHARE:") && !project.code.startsWith("FILE:")) {
                setTimeout(() => {
                    if (typeof queueSyncActiveProject === "function") {
                        queueSyncActiveProject(project.code);
                    }
                }, 100);
            }
        }
    }
}

function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-triangle-exclamation";
    if (type === "info") icon = "fa-circle-info";
    
    toast.innerHTML = `
        <i class="fa-solid ${icon} toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- STATE ACTIONS ---

// View Navigation Handler
function switchView(viewName) {
    // If they are leaving the specific project view with unsaved Gantt chart changes, prompt them
    if (window.ganttIsDirty && viewName !== "projects-list" && viewName !== "quoting-projects-list") {
        if (!confirm("⚠️ คุณมีข้อมูลแผนงาน (Plan Work) ที่ยังไม่ได้บันทึก!\nหากเปลี่ยนหน้า ข้อมูลล่าสุดที่คุณแก้ไขจะสูญหาย\n\nคุณต้องการเปลี่ยนหน้าโดยไม่บันทึกใช่หรือไม่?")) {
            return;
        }
        window.ganttIsDirty = false;
    }

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const projectCode = params.get("project") || "";

    if (!window.isInitialRouteInit) {
        // Initial page load routing logic
        if (path === "/login") {
            return;
        } else if (path === "/dashboard") {
            viewName = "dashboard";
        } else if (path === "/quoting") {
            viewName = "quoting-projects-list";
        } else if (path === "/projects") {
            viewName = "projects-list";
        } else if (path.startsWith("/project/")) {
            viewName = "projects-list";
            appState.selectedDetailProject = projectCode;
            sessionStorage.setItem("technical_water_last_detail_project", projectCode);
            
            if (path === "/project/info") appState.activeProjectTab = "general-info";
            else if (path === "/project/gantt") appState.activeProjectTab = "plan-work";
            else if (path === "/project/actual") appState.activeProjectTab = "actual-progress";
            else if (path === "/project/daily-report") appState.activeProjectTab = "daily-report";
            else if (path === "/project/photos") appState.activeProjectTab = "photos-files";
            else if (path === "/project/expenses") appState.activeProjectTab = "cost-tab";
            else if (path === "/project/documents") appState.activeProjectTab = "documents-tab";
        }
        window.isInitialRouteInit = true;
    } else {
        // Subsequent navigation redirects
        if (viewName === "dashboard" && path !== "/dashboard") {
            window.location.href = "/dashboard";
            return;
        }
        if (viewName === "quoting-projects-list" && path !== "/quoting") {
            window.location.href = "/quoting";
            return;
        }
        if (viewName === "projects-list" && path !== "/projects" && !path.startsWith("/project/")) {
            window.location.href = "/projects";
            return;
        }
        if (viewName === "cost") {
            window.location.href = "/dashboard"; // Cost is nested inside dashboard now
            return;
        }
    }

    // Check permission rules first
    const isCustOrTech = (appState.currentRole === "customer" || appState.currentRole === "technician" || appState.currentRole === "tech");
    
    if (isCustOrTech && (viewName === "cost" || viewName === "dashboard" || viewName === "permissions-mgmt")) {
        showToast("สิทธิ์ของคุณเข้าดูได้เฉพาะหน้าโครงการของตนเองเท่านั้น", "info");
        viewName = "projects-list";
    }
    if (appState.currentRole === "pe" && (viewName === "cost" || viewName === "permissions-mgmt")) {
        showToast("คุณไม่มีสิทธิ์เข้าถึงหน้านี้", "warning");
        viewName = "projects-list";
    }
    if (appState.currentRole === "pm" && viewName === "cost") {
        showToast("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (จำกัดเฉพาะ Admin และ Accounting)", "warning");
        viewName = "projects-list";
    }
    if (appState.currentRole === "accounting" && viewName === "permissions-mgmt") {
        showToast("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (จำกัดเฉพาะ Admin เท่านั้น)", "warning");
        viewName = "projects-list";
    }
    
    appState.currentView = viewName;

    // Reset active project state when going to general views
    if (viewName === "dashboard" || viewName === "cost" || viewName === "permissions-mgmt") {
        appState.selectedDetailProject = "all";
        appState.showCumulativeOverview = (viewName === "dashboard");
        sessionStorage.setItem("technical_water_last_detail_project", "all");
    } else if (viewName === "projects-list" || viewName === "quoting-projects-list") {
        appState.showCumulativeOverview = false;
    }
    
    // Toggle sidebar project subnav visibility
    const sidebarSubnav = document.getElementById("sidebar-project-subnav");
    const subnavHeaderIcon = document.getElementById("subnav-header-icon");
    const subnavHeaderTitle = document.getElementById("subnav-header-title");
    const navItemQuoting = document.getElementById("nav-item-quoting");
    const navItemProjects = document.getElementById("nav-item-projects");
    
    if (sidebarSubnav) {
        if (viewName === "projects-list" || viewName === "quoting-projects-list") {
            sidebarSubnav.style.display = "block";
            const sidebarCreateBtn = document.getElementById("sidebar-create-project-btn");
            const headerCreateBtn = document.getElementById("header-create-project-btn");
            
            const showCreate = (appState.currentRole === "pm" || appState.currentRole === "admin" || appState.currentRole === "accounting");
            
            if (viewName === "quoting-projects-list") {
                if (navItemQuoting && sidebarSubnav.previousElementSibling !== navItemQuoting) {
                    navItemQuoting.insertAdjacentElement("afterend", sidebarSubnav);
                }
                if (subnavHeaderIcon) subnavHeaderIcon.className = "fa-solid fa-file-invoice sidebar-proj-icon";
                if (subnavHeaderTitle) subnavHeaderTitle.textContent = "Quotation Detail";
                if (sidebarCreateBtn) {
                    sidebarCreateBtn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> สร้างรายการเสนอราคาใหม่`;
                    sidebarCreateBtn.style.display = showCreate ? "block" : "none";
                }
                if (headerCreateBtn) {
                    headerCreateBtn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> เพิ่มรายการเสนอราคา`;
                    headerCreateBtn.style.display = showCreate ? "inline-flex" : "none";
                }
            } else {
                if (navItemProjects && sidebarSubnav.previousElementSibling !== navItemProjects) {
                    navItemProjects.insertAdjacentElement("afterend", sidebarSubnav);
                }
                if (subnavHeaderIcon) subnavHeaderIcon.className = "fa-solid fa-folder-open sidebar-proj-icon";
                if (subnavHeaderTitle) subnavHeaderTitle.textContent = "Project Detail";
                if (sidebarCreateBtn) {
                    sidebarCreateBtn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> สร้างโครงการใหม่`;
                    sidebarCreateBtn.style.display = showCreate ? "block" : "none";
                }
                if (headerCreateBtn) {
                    headerCreateBtn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> สร้างโครงการใหม่`;
                    headerCreateBtn.style.display = showCreate ? "inline-flex" : "none";
                }
            }
        } else {
            sidebarSubnav.style.display = "none";
            const headerCreateBtn = document.getElementById("header-create-project-btn");
            if (headerCreateBtn) headerCreateBtn.style.display = "none";
        }
    }
    
    // Toggle active classes on nav
    document.querySelectorAll(".nav-item").forEach(item => {
        if (item.getAttribute("data-view") === viewName) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Toggle active view panel
    document.querySelectorAll(".view-panel").forEach(panel => {
        panel.classList.remove("active");
    });

    let targetPanelId = `${viewName}-view`;
    if (viewName === "projects-list" || viewName === "quoting-projects-list") targetPanelId = "projects-list-view";
    
    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
        targetPanel.classList.add("active");
    }

    // Special renders when navigating
    if (viewName === "dashboard") {
        renderOverallDashboard();
        renderSubnavProjectWorkspace();
    } else if (viewName === "cost") {
        renderCostManagement();
        renderSubnavProjectWorkspace();
    } else if (viewName === "projects-list" || viewName === "quoting-projects-list") {
        const portalStatusFilter = document.getElementById("portal-status-filter");
        if (portalStatusFilter) {
            portalStatusFilter.value = "all";
        }
        populateSubnavProjects(document.getElementById("subnav-year-filter") ? document.getElementById("subnav-year-filter").value : "all");
        renderSubnavProjectWorkspace();
    } else if (viewName === "permissions-mgmt") {
        renderPermissionsManagement();
        renderSubnavProjectWorkspace();
    }
}

// Role Toggler Handler
function switchRole(roleName) {
    appState.currentRole = roleName;
    
    // Adjust DOM classes
    document.body.className = `role-${roleName}`;
    
    // Update labels in header
    const roleBadge = document.getElementById("active-role-badge");
    const roleDisplay = document.getElementById("user-role-display");
    const usernameDisplay = document.getElementById("username-display");

    const headerUserName = document.getElementById("header-user-name");
    const headerUserRole = document.getElementById("header-user-role");
    const dropdownUserDisplayname = document.getElementById("dropdown-user-displayname");
    const dropdownUserRoleDisplay = document.getElementById("dropdown-user-role-display");
    const dropdownUserAvatar = document.getElementById("dropdown-user-avatar");
    const headerUserAvatar = document.getElementById("header-user-avatar");

    // Standard avatars
    const defaultAvatars = {
        "admin": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        "pm": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        "accounting": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        "customer": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    };
    
    if (roleName === "admin") {
        if (roleBadge) roleBadge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> AD (Admin Manager)`;
        if (roleDisplay) roleDisplay.textContent = "Admin Manager";
        if (usernameDisplay) usernameDisplay.textContent = "Super Admin";

        if (headerUserName) headerUserName.textContent = "Super Admin";
        if (headerUserRole) headerUserRole.textContent = "Admin Manager";
        if (dropdownUserDisplayname) dropdownUserDisplayname.textContent = "Super Admin";
        if (dropdownUserRoleDisplay) dropdownUserRoleDisplay.textContent = "Admin Manager";
        if (headerUserAvatar) headerUserAvatar.src = defaultAvatars["admin"];
        if (dropdownUserAvatar) dropdownUserAvatar.src = defaultAvatars["admin"];

        showToast("สลับบทบาทเป็น: Admin (ผู้ดูแลระบบ) จัดการระบบทั้งหมด", "success");
    } else if (roleName === "pm") {
        if (roleBadge) roleBadge.innerHTML = `<i class="fa-solid fa-user-lock"></i> PM (Project Manager)`;
        if (roleDisplay) roleDisplay.textContent = "Project Manager";
        if (usernameDisplay) usernameDisplay.textContent = "Project Manager";

        if (headerUserName) headerUserName.textContent = "Project Manager";
        if (headerUserRole) headerUserRole.textContent = "Project Manager";
        if (dropdownUserDisplayname) dropdownUserDisplayname.textContent = "Project Manager";
        if (dropdownUserRoleDisplay) dropdownUserRoleDisplay.textContent = "Project Manager";
        if (headerUserAvatar) headerUserAvatar.src = defaultAvatars["pm"];
        if (dropdownUserAvatar) dropdownUserAvatar.src = defaultAvatars["pm"];

        showToast("สลับบทบาทเป็น: Project Manager (ทีมโครงการ) เข้าใช้งานระบบ", "success");
    } else if (roleName === "accounting") {
        if (roleBadge) roleBadge.innerHTML = `<i class="fa-solid fa-file-invoice-dollar"></i> AC (Accounting)`;
        if (roleDisplay) roleDisplay.textContent = "Accountant";
        if (usernameDisplay) usernameDisplay.textContent = "Account System";

        if (headerUserName) headerUserName.textContent = "Account System";
        if (headerUserRole) headerUserRole.textContent = "Accountant";
        if (dropdownUserDisplayname) dropdownUserDisplayname.textContent = "Account System";
        if (dropdownUserRoleDisplay) dropdownUserRoleDisplay.textContent = "Accountant";
        if (headerUserAvatar) headerUserAvatar.src = defaultAvatars["accounting"];
        if (dropdownUserAvatar) dropdownUserAvatar.src = defaultAvatars["accounting"];

        showToast("สลับบทบาทเป็น: Accounting (บัญชี) ห้ามลบข้อมูลหลัก", "info");
    } else if (roleName === "customer" || roleName === "pe" || roleName === "technician" || roleName === "tech") {
        // Determine which customer user and their permissions
        const cUserKey = appState.currentCustomerUser || "user1";
        localStorage.setItem("technical_water_current_customer_user", cUserKey);
        
        const acc = appState.customerAccounts[cUserKey];
        const dispName = acc ? acc.name : "Customer View";
        
        if (roleName === "customer") {
            if (roleBadge) roleBadge.innerHTML = `<i class="fa-solid fa-user-tie"></i> CS (${dispName})`;
            if (roleDisplay) roleDisplay.textContent = "Customer View";

            if (headerUserName) headerUserName.textContent = dispName;
            if (headerUserRole) headerUserRole.textContent = "Customer";
            if (dropdownUserDisplayname) dropdownUserDisplayname.textContent = dispName;
            if (dropdownUserRoleDisplay) dropdownUserRoleDisplay.textContent = "Customer";

            showToast(`สลับบทบาทเป็น: ${dispName} — สิทธิ์จำกัดตาม PM กำหนด`, "info");
        } else if (roleName === "pe") {
            if (roleBadge) roleBadge.innerHTML = `<i class="fa-solid fa-helmet-safety"></i> PE (${dispName})`;
            if (roleDisplay) roleDisplay.textContent = "Project Engineer";

            if (headerUserName) headerUserName.textContent = dispName;
            if (headerUserRole) headerUserRole.textContent = "Project Engineer";
            if (dropdownUserDisplayname) dropdownUserDisplayname.textContent = dispName;
            if (dropdownUserRoleDisplay) dropdownUserRoleDisplay.textContent = "Project Engineer";

            showToast(`สลับบทบาทเป็น: PE: ${dispName} — แก้ไขเฉพาะโครงการที่ได้รับสิทธิ์`, "info");
        } else {
            if (roleBadge) roleBadge.innerHTML = `<i class="fa-solid fa-screwdriver-wrench"></i> Tech (${dispName})`;
            if (roleDisplay) roleDisplay.textContent = "Technician View";

            if (headerUserName) headerUserName.textContent = dispName;
            if (headerUserRole) headerUserRole.textContent = "Technician";
            if (dropdownUserDisplayname) dropdownUserDisplayname.textContent = dispName;
            if (dropdownUserRoleDisplay) dropdownUserRoleDisplay.textContent = "Technician";

            showToast(`สลับบทบาทเป็น: Tech: ${dispName} — ดูอย่างเดียวเฉพาะโครงการที่ได้รับสิทธิ์`, "info");
        }
        if (usernameDisplay) usernameDisplay.textContent = dispName;
        
        const avatarUrl = acc ? acc.avatar : defaultAvatars["customer"];
        if (headerUserAvatar) headerUserAvatar.src = avatarUrl;
        if (dropdownUserAvatar) dropdownUserAvatar.src = avatarUrl;

        // Get allowed hospitals and projects for this user
        const perms = appState.userPermissions[cUserKey] || { hospitals: [], projects: [] };
        const allowedHospitals = perms.hospitals || [];
        const allowedProjects = perms.projects || [];

        // Find accessible projects for this customer/pe/tech user
        const accessibleProjects = Object.values(projectsData).filter(p => isProjectAllowedForCustomer(p, perms));
        
        const firstProj = accessibleProjects[0] || null;
        const firstCode = firstProj ? firstProj.code : "";
        
        appState.selectedDetailProject = "all";
        sessionStorage.setItem("technical_water_last_detail_project", "all");
        
        const subnavYearFilter = document.getElementById("subnav-year-filter");
        if (subnavYearFilter) {
            subnavYearFilter.value = "all";
            subnavYearFilter.disabled = false;
        }
        
        populateSubnavHospitals();
        const hospitalSelector = document.getElementById("subnav-hospital-selector");
        if (hospitalSelector) {
            hospitalSelector.value = "all";
            hospitalSelector.disabled = false;
        }

        populateSubnavProjects("all");
        
        const projectSelector = document.getElementById("subnav-project-selector");
        if (projectSelector) {
            projectSelector.value = "all";
            projectSelector.disabled = false;
        }

        // Boot customer to project workspace
        switchView("projects-list");
        return;
    }

    // Enable/disable project subnav selectors based on role
    const subnavYearFilter = document.getElementById("subnav-year-filter");
    if (subnavYearFilter && roleName !== "customer") {
        subnavYearFilter.disabled = false;
    }
    const hospitalSelector = document.getElementById("subnav-hospital-selector");
    if (hospitalSelector && roleName !== "customer") {
        hospitalSelector.disabled = false;
    }
    const projectSelector = document.getElementById("subnav-project-selector");
    if (projectSelector && roleName !== "customer") {
        projectSelector.disabled = false;
    }
    const costDetailYearFilter = document.getElementById("cost-detail-year-filter");
    if (costDetailYearFilter && roleName !== "customer") {
        costDetailYearFilter.disabled = false;
    }
    const costDetailHospitalSelector = document.getElementById("cost-detail-hospital-selector");
    if (costDetailHospitalSelector && roleName !== "customer") {
        costDetailHospitalSelector.disabled = false;
    }
    const costSelector = document.getElementById("cost-project-selector");
    if (costSelector && roleName !== "customer") {
        costSelector.disabled = false;
    }

    // Refresh current view to apply role restrictions
    switchView(appState.currentView || "dashboard");

    // Apply notification role filter (accounting sees only approval notifs)
    if (typeof window.applyNotifRoleFilter === "function") {
        window.applyNotifRoleFilter(roleName);
    }
}

// --- RENDERING FUNCTIONS ---

// 1. Overall Dashboard (Section 1)
function renderOverallDonutChart(inprogress, finished, completed, pendingApproval) {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }
    try {
        const ctx = document.getElementById('overallDonutChart').getContext('2d');
        
        if (overallDonutChart) {
            overallDonutChart.destroy();
        }
        
        const total = inprogress + finished + completed + pendingApproval;
        const ipPercent = total > 0 ? Math.round((inprogress / total) * 100) : 0;
        const finishPercent = total > 0 ? Math.round((finished / total) * 100) : 0;
        const compPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
        const pendingPercent = total > 0 ? 100 - ipPercent - finishPercent - compPercent : 0;

        overallDonutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    `งานที่กำลังดำเนินการ ${ipPercent}%`, 
                    `งานที่ดำเนินการเสร็จแล้ว ${finishPercent}%`,
                    `งานเสร็จแล้วรอส่งงาน/อนุมัติ ${compPercent}%`, 
                    `งานที่รอเสนอราคา ${pendingPercent}%`
                ],
                datasets: [{
                    data: [inprogress, finished, completed, pendingApproval],
                    backgroundColor: ['#059669', '#8b5cf6', '#0284c7', '#f59e0b'],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            font: { size: 10, family: 'Prompt' }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error drawing overall donut chart:", err);
    }
}

function renderHospitalsGrid(activeProjects) {
    const gridContainer = document.getElementById("hospitals-card-grid");
    if (!gridContainer) return;
    
    gridContainer.innerHTML = "";
    
    const allHospitalsList = [
        "โรงพยาบาลพญาไท 1",
        "โรงพยาบาลพญาไท 2",
        "โรงพยาบาลพญาไท 3",
        "โรงพยาบาลพญาไท นวมินทร์",
        "โรงพยาบาลพญาไท บ่อวิน",
        "โรงพยาบาลพญาไท พหลโยธิน",
        "โรงพยาบาลพญาไท ศรีราชา",
        "โรงพยาบาลเปาโล พระประแดง",
        "โรงพยาบาลเปาโล รังสิต",
        "โรงพยาบาลเปาโล สมุทรปราการ",
        "โรงพยาบาลเปาโล เกษตร",
        "โรงพยาบาลเปาโล โชคชัย 4",
        "อื่นๆ"
    ];
    
    // Build a set of known/predefined hospitals for "อื่นๆ" matching
    const knownHospitals = new Set(allHospitalsList.filter(h => h !== "อื่นๆ"));
    
    allHospitalsList.forEach(hospital => {
        // Find all projects of this hospital in the active projects list that are NOT 100% completed
        const isOthers = (hospital === "อื่นๆ");
        const hospitalProjects = activeProjects.filter(item => {
            const matchesHospital = isOthers ? !knownHospitals.has(item.customer) : item.customer === hospital;
            const progressVal = (item.progress !== undefined && item.progress !== null) ? parseFloat(item.progress.toString().replace("%", "")) : NaN;
            const isNotCompleted = isNaN(progressVal) || progressVal < 100;
            return matchesHospital && isNotCompleted;
        });
        
        // Sort projects by year descending (newest first)
        hospitalProjects.sort((a, b) => b.year - a.year);
        
        const card = document.createElement("div");
        card.style.marginBottom = "16px";
        
        if (hospitalProjects.length > 0) {
            card.className = "hospital-card";
            card.style.cursor = "default";
            
            // Sum metrics across all projects for this hospital
            let totalValue = 0;
            let totalCost = 0;
            let totalProfit = 0;
            
            // Count projects status for this hospital across all years
            const allHospitalProjects = Object.values(projectsData).filter(p => isOthers ? !knownHospitals.has(p.customer) : p.customer === hospital);
            let totalProjects = allHospitalProjects.length;
            let finishedProjects = 0;
            let completedProjects = 0;
            let inprogressProjects = 0;
            let delayedProjects = 0;
            
            allHospitalProjects.forEach(p => {
                if (p.status === "งานที่ดำเนินการเสร็จแล้ว" || p.status === "เสร็จสิ้น") {
                    finishedProjects++;
                } else if (p.status === "เสร็จแล้ว" || p.status === "งานเสร็จแล้วรอส่งงาน" || p.status === "งานเสร็จแล้วรอส่งงาน/อนุมัติ") {
                    completedProjects++;
                } else if (p.status === "รออนุมัติ" || p.status === "งานรออนุมัติ" || p.status === "งานที่รอเสนอราคา" || p.status === "งานที่กำลังเสนอราคา" || p.status === "กำลังเสนอราคา") {
                    delayedProjects++;
                } else {
                    inprogressProjects++;
                }
            });
            
            hospitalProjects.forEach(p => {
                totalValue += p.value || 0;
                totalCost += p.cost || 0;
                totalProfit += (p.value || 0) - (p.cost || 0);
            });
            
            const hideCost = (appState.currentRole === "customer" || appState.currentRole === "technician" || appState.currentRole === "tech");
            
            const financialsHTML = hideCost 
                ? `<div style="font-size: 11px; color: var(--text-muted); font-style: italic; margin-top: 12px; padding: 10px; background: var(--bg-light); border-radius: var(--radius-sm); text-align: center; border: 1px solid var(--border-color);">
                     <i class="fa-solid fa-lock" style="font-size: 10px; margin-right: 2px;"></i> ข้อมูลต้นทุนถูกปกปิด (บทบาทลูกค้า)
                   </div>`
                : `<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px; padding: 12px; background: var(--bg-light); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                     <div style="display: flex; justify-content: space-between; font-size: 11px;">
                         <span style="color: var(--text-muted); font-weight: 600;">มูลค่าโครงการรวม</span>
                         <span style="color: var(--navy-dark); font-weight: 700;">${formatNumber(totalValue)} บาท</span>
                     </div>
                     <div style="display: flex; justify-content: space-between; font-size: 11px;">
                         <span style="color: var(--text-muted); font-weight: 600;">ต้นทุนโครงการรวม</span>
                         <span style="color: var(--navy-dark); font-weight: 700;">${formatNumber(totalCost)} บาท</span>
                     </div>
                     <div class="hide-pm" style="display: flex; justify-content: space-between; font-size: 11px; border-top: 1px dashed var(--border-color); padding-top: 6px;">
                         <span style="color: var(--navy-medium); font-weight: 700;">กำไรรวมประมาณการ</span>
                         <span style="color: var(--color-inprogress); font-weight: 700;">${formatNumber(totalProfit)} บาท</span>
                     </div>
                   </div>`;
            
            // Build projects listing HTML in table/list format
            let projectsHTML = `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <h5 style="font-size: 12px; font-weight: 700; color: var(--navy-dark); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-folder-open text-blue"></i> รายการโครงการกำลังดำเนินการ (${hospitalProjects.length})
                    </h5>
                    <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; padding-right: 6px; scrollbar-width: thin;">
            `;
            
            hospitalProjects.forEach(p => {
                const projectProfit = (p.value || 0) - (p.cost || 0);
                
                const costBreakdownHTML = hideCost
                    ? `<div style="font-size: 10px; color: var(--text-muted); font-style: italic;">
                         <i class="fa-solid fa-lock"></i> ข้อมูลต้นทุนถูกปกปิด
                       </div>`
                    : `<div style="display: flex; gap: 16px; font-size: 11px; background: rgba(255,255,255,0.7); padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid #cbd5e1;">
                         <div><span style="color: var(--text-muted); font-size: 10px;">มูลค่า:</span> <strong style="color: var(--navy-dark);">${formatNumber(p.value)}</strong></div>
                         <div><span style="color: var(--text-muted); font-size: 10px;">ต้นทุน:</span> <strong style="color: var(--navy-dark);">${formatNumber(p.cost)}</strong></div>
                         <div class="hide-pm"><span style="color: var(--text-muted); font-size: 10px;">กำไร:</span> <strong style="color: ${projectProfit >= 0 ? 'var(--color-inprogress)' : '#ef4444'};">${formatNumber(projectProfit)}</strong></div>
                       </div>`;
                
                const poDateStr = p.poDate || p.start || '15/01/2026';
                const statusBadgeHTML = getStatusBadgeHTML(p.status);

                projectsHTML += `
                    <div class="project-group-item" data-code="${p.code}" data-hospital="${hospital}" style="padding: 14px; border: 1.5px solid #cbd5e1; border-radius: var(--radius-md); background: var(--bg-white); cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; gap: 10px; box-shadow: var(--shadow-sm);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span style="font-weight: 800; font-size: 13px; color: var(--primary-blue); display: inline-flex; align-items: center; gap: 6px;">
                                    ${p.code}
                                    <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #e0f2fe; color: #0369a1;">ปี ${p.year}</span>
                                </span>
                                ${statusBadgeHTML}
                                <span style="font-size: 11px; font-weight: 600; color: #475569; display: inline-flex; align-items: center; gap: 4px; background: #f8fafc; padding: 3px 9px; border-radius: 6px; border: 1px solid #cbd5e1;">
                                    <i class="fa-solid fa-calendar-day text-blue"></i> วันที่ออก PO: ${poDateStr}
                                </span>
                            </div>
                            <span style="font-size: 11.5px; font-weight: 800; color: var(--color-inprogress); background: #f0fdf4; padding: 3px 8px; border-radius: 6px; border: 1px solid #bbf7d0;">
                                ความคืบหน้า: ${p.progress || 0}%
                            </span>
                        </div>
                        
                        <div style="font-size: 13px; font-weight: 700; color: var(--navy-dark); line-height: 1.4;">
                            ${p.name}
                        </div>
                        
                        <!-- Cost & Financials breakdown for this project -->
                        ${costBreakdownHTML}
                    </div>
                `;
            });
            
            projectsHTML += `
                    </div>
                </div>
            `;
            
            card.innerHTML = `
                <!-- 1. Top Header: Hospital Name on Top-Left -->
                <div class="hospital-card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h4 style="font-size: 16px; font-weight: 700; color: var(--navy-dark); margin: 0; line-height: 1;">${hospital}</h4>
                        <span style="background: #e0f2fe; color: #0369a1; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
                            ${hospitalProjects.length} โครงการดำเนินการ
                        </span>
                    </div>
                </div>

                <!-- 2. Body Grid: Left Projects, Right Financials -->
                <div class="hospital-card-body">
                    <!-- Left Side: Projects list with costs -->
                    <div class="hospital-projects-col">
                        ${projectsHTML}
                    </div>

                    <!-- Right Side: Hospital Info & Combined Financials -->
                    <div class="hospital-info-col" style="display: flex; flex-direction: column; gap: 12px; border-left: 1px solid var(--border-color); padding-left: 24px;">
                        ${financialsHTML}
                        
                        <div style="margin-top: auto; padding-top: 12px; display: flex; flex-wrap: wrap; gap: 6px;">
                            <div style="font-size: 10px; font-weight: 700; color: var(--navy-medium); background: var(--bg-light); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-folder-tree"></i> ทั้งหมด ${totalProjects}
                            </div>
                            <div style="font-size: 10px; font-weight: 700; color: #8b5cf6; background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.2); padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-circle-check"></i> เสร็จสิ้น ${finishedProjects}
                            </div>
                            <div style="font-size: 10px; font-weight: 700; color: #0284c7; background: rgba(2,132,199,0.06); border: 1px solid rgba(2,132,199,0.2); padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-circle-check"></i> รอส่งงาน ${completedProjects}
                            </div>
                            <div style="font-size: 10px; font-weight: 700; color: #059669; background: rgba(5,150,105,0.06); border: 1px solid rgba(5,150,105,0.2); padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-circle-play"></i> ดำเนินการ ${inprogressProjects}
                            </div>
                            <div style="font-size: 10px; font-weight: 700; color: #f59e0b; background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2); padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-circle-pause"></i> รออนุมัติ/เสนอราคา ${delayedProjects}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add click listener to route when a project item is clicked
            card.addEventListener("click", (e) => {
                const projItem = e.target.closest(".project-group-item");
                if (!projItem) return;
                
                const targetCode = projItem.getAttribute("data-code");
                const targetHospital = projItem.getAttribute("data-hospital");
                if (!targetCode) return;
                
                appState.selectedDetailProject = targetCode;
                sessionStorage.setItem("technical_water_last_detail_project", targetCode);
                
                const hospitalSelector = document.getElementById("subnav-hospital-selector");
                if (hospitalSelector) {
                    hospitalSelector.value = targetHospital;
                }
                
                const subnavYearFilter = document.getElementById("subnav-year-filter");
                populateSubnavProjects(subnavYearFilter ? subnavYearFilter.value : "all");
                
                const projectSelector = document.getElementById("subnav-project-selector");
                if (projectSelector) {
                    projectSelector.value = targetCode;
                }
                
                switchView("projects-list");
                renderSubnavProjectWorkspace();
                if (window.closeMobileSidebar) window.closeMobileSidebar();
            });
            
        } else {
            // Render inactive card (greyed-out full row)
            card.className = "hospital-card inactive-hospital-card";
            card.style.opacity = "0.6";
            card.style.cursor = "default";
            card.style.border = "1px dashed var(--border-color)";
            card.style.backgroundColor = "var(--bg-light)";
            card.style.boxShadow = "none";
            
            card.innerHTML = `
                <!-- 1. Top Header: Hospital Name on Top-Left -->
                <div class="hospital-card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h4 style="font-size: 15px; font-weight: 700; color: var(--text-muted); margin: 0; line-height: 1;">${hospital}</h4>
                        <span style="font-size: 9px; padding: 2px 6px; background-color: #e2e8f0; color: #64748b; border-radius: 4px; font-weight: 600;">ไม่มีโครงการดำเนินการ</span>
                    </div>
                </div>

                <!-- 2. Body Grid: Empty State -->
                <div class="hospital-card-body">
                    <div class="hospital-projects-col" style="font-size: 12px; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 0; font-style: italic;">
                        <i class="fa-solid fa-folder-open" style="font-size: 20px; margin-bottom: 6px; display: block; opacity: 0.5;"></i>
                        ไม่มีโครงการกำลังดำเนินการในโฟลเดอร์นี้
                    </div>
                    <div class="hospital-info-col" style="display: flex; flex-direction: column; justify-content: center; border-left: 1px solid var(--border-color); padding-left: 24px;">
                        <span style="font-size: 11px; color: var(--text-muted); font-style: italic;">(ไม่มีการทำธุรกรรมหรือค่าใช้จ่าย)</span>
                    </div>
                </div>
            `;
        }
        
        gridContainer.appendChild(card);
    });
}

// 2. Project Detail workspace and Tab views (Subtabs)

function renderSubnavProjectWorkspace() {
    const activeCode = appState.selectedDetailProject;
    const path = window.location.pathname;

    // Redirect to project info page or keep current subpage path if a project is selected
    if (activeCode && activeCode !== "all") {
        const params = new URLSearchParams(window.location.search);
        const currentUrlProj = params.get("project") || "";
        
        if (currentUrlProj !== activeCode) {
            let targetPath = path;
            if (!path.startsWith("/project/")) {
                targetPath = "/project/info"; // fallback to info subpage
            }
            window.location.href = `${targetPath}?project=${encodeURIComponent(activeCode)}`;
            return;
        }
    }

    // Redirect back to /projects if we are on a project-specific path but activeCode is "all"
    if (activeCode === "all" && path.startsWith("/project/")) {
        window.location.href = "/projects";
        return;
    }
    
    // Reset active subtab to general-info when not in public view mode
    if (activeCode !== "all" && window.lastRenderedProject !== activeCode && !document.body.classList.contains("public-view-mode")) {
        appState.activeProjectTab = "general-info";
        appState.selectedGalleryFolder = null;
    }
    window.lastRenderedProject = activeCode;

    const showCumulative = !!appState.showCumulativeOverview;

    const portal = document.getElementById("project-selection-portal");
    const workspace = document.getElementById("project-workspace-layout");
    const sidebarSubnav = document.getElementById("sidebar-project-subnav");
    const sidebarSelectorWrapper = document.getElementById("sidebar-project-selector-wrapper");
    const sidebarBackWrapper = document.getElementById("sidebar-back-to-portal-wrapper");

    // Toggle main navigation links visibility based on active workspace mode
    const mainNavItems = document.querySelectorAll(".sidebar-nav > a.nav-item");

    // Toggle Portal vs Workspace display
    if (activeCode === "all" && !showCumulative) {
        if (portal) portal.style.display = "flex";
        if (workspace) workspace.style.display = "none";
        
        // Hide nested project details, show main navigation links
        if (sidebarSubnav) sidebarSubnav.style.display = "none";
        if (sidebarSelectorWrapper) sidebarSelectorWrapper.style.display = "none";
        if (sidebarBackWrapper) sidebarBackWrapper.style.display = "none";
        mainNavItems.forEach(item => item.style.display = "");
        
        if (typeof window.renderProjectSelectionPortal === "function") {
            window.renderProjectSelectionPortal();
        }
        return;
    } else {
        if (portal) portal.style.display = "none";
        if (workspace) workspace.style.display = "block";

        if (activeCode !== "all") {
            // SPECIFIC PROJECT VIEW: Show project subnav details, hide main nav
            if (sidebarSubnav) sidebarSubnav.style.display = "block";
            if (sidebarSelectorWrapper) sidebarSelectorWrapper.style.display = "none";
            if (sidebarBackWrapper) sidebarBackWrapper.style.display = "block";
            mainNavItems.forEach(item => item.style.display = "none");
            
            const tabsNav = document.querySelector(".subnav-tabs");
            if (tabsNav) tabsNav.style.display = "flex";
        } else {
            // CUMULATIVE DASHBOARD VIEW: Hide project subnav details, show main nav
            if (sidebarSubnav) sidebarSubnav.style.display = "none";
            if (sidebarSelectorWrapper) sidebarSelectorWrapper.style.display = "none";
            if (sidebarBackWrapper) sidebarBackWrapper.style.display = "none";
            mainNavItems.forEach(item => item.style.display = "");
            
            const tabsNav = document.querySelector(".subnav-tabs");
            if (tabsNav) tabsNav.style.display = "none";
        }
    }

    const hospitalSelector = document.getElementById("subnav-hospital-selector");
    const projectSelector = document.getElementById("subnav-project-selector");
    const subnavYearFilter = document.getElementById("subnav-year-filter");

    let project;
    if (activeCode === "all") {
        const hospitalVal = hospitalSelector ? hospitalSelector.value : "all";
        const yearFilterVal = subnavYearFilter ? subnavYearFilter.value : "all";
        
        const matched = Object.values(projectsData).filter(p => {
            const hospitalMatch = hospitalVal === "all" || p.customer === hospitalVal;
            const yearMatch = yearFilterVal === "all" || p.year === parseInt(yearFilterVal);
            return hospitalMatch && yearMatch;
        });
        
        const wbTotal = [0, 0, 0, 0, 0, 0];
        const wbInprogress = [0, 0, 0, 0, 0, 0];
        const wbCompleted = [0, 0, 0, 0, 0, 0];
        const wbDelayed = [0, 0, 0, 0, 0, 0];
        
        matched.forEach(p => {
            if (p.workBreakdown && p.workBreakdown.total) {
                for (let i = 0; i < 6; i++) {
                    wbTotal[i] += p.workBreakdown.total[i] || 0;
                    wbInprogress[i] += p.workBreakdown.inprogress[i] || 0;
                    wbCompleted[i] += p.workBreakdown.completed[i] || 0;
                    wbDelayed[i] += p.workBreakdown.delayed[i] || 0;
                }
            }
        });
        
        const totalValue = matched.reduce((sum, p) => sum + p.value, 0);
        const totalCost = matched.reduce((sum, p) => sum + p.cost, 0);
        const totalProfit = totalValue - totalCost;
        const avgProgress = matched.length > 0 ? Math.round(matched.reduce((sum, p) => sum + p.progress, 0) / matched.length) : 0;
        const avgPlannedProgress = matched.length > 0 ? Math.round(matched.reduce((sum, p) => sum + p.plannedProgress, 0) / matched.length) : 0;
        
        const allTasks = [];
        matched.forEach(p => {
            if (p.tasks) {
                p.tasks.forEach(t => {
                    allTasks.push({ ...t, title: `[${p.code}] ${t.title}` });
                });
            }
        });
        const allPlans = [];
        matched.forEach(p => {
            if (p.plans) {
                p.plans.forEach(pl => {
                    allPlans.push({ ...pl, title: `[${p.code}] ${pl.title}` });
                });
            }
        });
        const allExpenses = [];
        matched.forEach(p => {
            if (p.expenses) {
                p.expenses.forEach(ex => {
                    allExpenses.push({ ...ex, projectCode: p.code });
                });
            }
        });
        const allDailyReports = [];
        matched.forEach(p => {
            if (p.dailyReports) {
                p.dailyReports.forEach(dr => {
                    allDailyReports.push({ ...dr, projectCode: p.code });
                });
            }
        });
        const allMedia = [];
        matched.forEach(p => {
            if (p.media) {
                p.media.forEach(m => {
                    allMedia.push({ ...m, projectCode: p.code });
                });
            }
        });
        
        project = {
            code: "ALL PROJECTS",
            name: `ภาพรวมสะสม (${matched.length} โครงการ)`,
            customer: hospitalVal === "all" ? "ทั้งหมดทุกโรงพยาบาล" : hospitalVal,
            manager: "ทีมผู้จัดการโครงการร่วม",
            start: matched.length > 0 ? matched[0].start : "-",
            end: matched.length > 0 ? matched[matched.length - 1].end : "-",
            value: totalValue,
            cost: totalCost,
            profit: totalProfit,
            progress: avgProgress,
            plannedProgress: avgPlannedProgress,
            description: `ข้อมูลสรุปรวมสะสมจากทั้งหมด ${matched.length} โครงการย่อยในระบบ`,
            jobs: {
                total: matched.reduce((sum, p) => sum + p.jobs.total, 0),
                inprogress: matched.reduce((sum, p) => sum + p.jobs.inprogress, 0),
                completed: matched.reduce((sum, p) => sum + p.jobs.completed, 0),
                delayed: matched.reduce((sum, p) => sum + p.jobs.delayed, 0)
            },
            workBreakdown: {
                categories: ["งานระบบไฟฟ้า", "งานระบบปรับอากาศ", "งานระบบสุขาภิบาล", "งานโครงสร้าง", "งานสถาปัตย์", "งานอื่นๆ"],
                total: wbTotal,
                inprogress: wbInprogress,
                completed: wbCompleted,
                delayed: wbDelayed
            },
            tasks: allTasks,
            plans: allPlans,
            expenses: allExpenses,
            dailyReports: allDailyReports,
            media: allMedia
        };
    } else {
        project = projectsData[activeCode];
        if (project) {
            recalculateJobsFromTasks(project);
        }
    }
    
    if (!project) return;
    
    // Update subnav header code display
    document.getElementById("subnav-proj-code").textContent = activeCode === "all" ? "ALL" : activeCode;
    
    if (projectSelector && projectSelector.value !== activeCode) {
        projectSelector.value = activeCode;
    }
    if (hospitalSelector && activeCode !== "all" && hospitalSelector.value !== project.customer) {
        hospitalSelector.value = project.customer;
        populateSubnavProjects(subnavYearFilter ? subnavYearFilter.value : "all");
    }
    
    // Update subnav status selector and badge
    const subnavStatusSelect = document.getElementById("subnav-project-status-selector");
    const subnavStatusBadge = document.getElementById("subnav-status-badge");
    const inlineStatusSelect = document.getElementById("subnav-project-status-selector-inline");
    const inlineStatusBadge = document.getElementById("subnav-status-badge-inline");

    if (subnavStatusSelect) {
        if (activeCode === "all") {
            subnavStatusSelect.disabled = true;
            if (subnavStatusBadge) {
                subnavStatusBadge.textContent = "ALL";
                subnavStatusBadge.style.background = "#e2e8f0";
                subnavStatusBadge.style.color = "#475569";
            }
            if (inlineStatusSelect) inlineStatusSelect.disabled = true;
            if (inlineStatusBadge) {
                inlineStatusBadge.textContent = "ALL";
                inlineStatusBadge.style.background = "#e2e8f0";
                inlineStatusBadge.style.color = "#475569";
            }
        } else {
            subnavStatusSelect.disabled = false;
            if (inlineStatusSelect) inlineStatusSelect.disabled = false;
            
            let currentStatus = project.status || "งานที่กำลังดำเนินการ";
            if (currentStatus === "กำลังดำเนินการ" || currentStatus === "กำลังเสนอราคา") currentStatus = "งานที่กำลังดำเนินการ";
            if (currentStatus === "เสร็จสิ้น" || currentStatus === "งานเสร็จแล้วรอส่งงาน") currentStatus = "งานเสร็จแล้วรอส่งงาน/อนุมัติ";
            if (currentStatus === "รออนุมัติ" || currentStatus === "งานรออนุมัติ" || currentStatus === "งานที่กำลังเสนอราคา") currentStatus = "งานที่รอเสนอราคา";
            
            subnavStatusSelect.value = currentStatus;
            if (inlineStatusSelect) inlineStatusSelect.value = currentStatus;

            if (subnavStatusBadge) {
                subnavStatusBadge.textContent = currentStatus;
                if (currentStatus === "งานเสร็จแล้วรอส่งงาน/อนุมัติ") {
                    subnavStatusBadge.style.background = "#e0f2fe";
                    subnavStatusBadge.style.color = "#0369a1";
                } else if (currentStatus === "งานที่รอเสนอราคา") {
                    subnavStatusBadge.style.background = "#fef3c7";
                    subnavStatusBadge.style.color = "#b45309";
                } else {
                    subnavStatusBadge.style.background = "#dcfce7";
                    subnavStatusBadge.style.color = "#15803d";
                }
            }

            if (inlineStatusBadge) {
                inlineStatusBadge.textContent = currentStatus;
                if (currentStatus === "งานเสร็จแล้วรอส่งงาน/อนุมัติ") {
                    inlineStatusBadge.style.background = "#e0f2fe";
                    inlineStatusBadge.style.color = "#0369a1";
                } else if (currentStatus === "งานที่รอเสนอราคา") {
                    inlineStatusBadge.style.background = "#fef3c7";
                    inlineStatusBadge.style.color = "#b45309";
                } else {
                    inlineStatusBadge.style.background = "#dcfce7";
                    inlineStatusBadge.style.color = "#15803d";
                }
            }
        }
    }
    
    // Toggle visibility of add buttons if showing All Projects
    const addBtns = [
        document.getElementById("open-task-modal-btn"),
        document.getElementById("subnav-open-daily-report-modal-btn"),
        document.getElementById("open-plan-modal-btn"),
        document.getElementById("open-plan-doc-modal-btn"),
        document.getElementById("open-media-modal-btn"),
        document.getElementById("open-doc-upload-btn"),
        document.getElementById("open-edit-project-btn")
    ];
    addBtns.forEach(btn => {
        if (btn) {
            btn.style.display = activeCode === "all" ? "none" : "";
        }
    });
    
    // Update labels and details for subtab 7: Documents tab left info panel
    const docCodeEl = document.getElementById("subnav-doc-code");
    if (docCodeEl) {
        docCodeEl.textContent = project.code;
        document.getElementById("subnav-doc-name").textContent = project.name;
        document.getElementById("subnav-doc-customer").textContent = project.customer;
        document.getElementById("subnav-doc-pm").textContent = project.manager;
        document.getElementById("subnav-doc-dates").textContent = `${project.start} - ${project.end}`;
        document.getElementById("subnav-doc-value").textContent = `${formatNumber(project.value)} บาท`;
        document.getElementById("subnav-doc-desc").textContent = project.description;
    }
    
    const isCustomer = (appState.currentRole === "customer" || appState.currentRole === "technician" || appState.currentRole === "tech");
    
    // Toggle sidebar subnav tabs container visibility
    const subnavTabsEl = document.querySelector(".subnav-tabs");
    if (subnavTabsEl) {
        subnavTabsEl.style.display = "";
    }
    
    if (isCustomer) {
        // For customer, make all views active (except cost) and render everything in a stacked list
        document.querySelectorAll(".subtab-panel").forEach(panel => {
            if (panel.id !== "subtab-cost-tab-view") {
                panel.classList.add("active");
                panel.style.removeProperty("margin-bottom");
                panel.style.marginBottom = "24px";
            } else {
                panel.classList.remove("active");
            }
        });
        
        // Render all views sequentially
        renderSubnavGeneralInfo(project);
        renderSubnavPlanWork(project);
        renderSubnavActualProgress(project);
        renderSubnavDailyReports(project);
        renderSubnavPhotosFiles(project);
        renderSubnavDocumentsTab(project);
    } else {
        // Restore standard tab behaviors
        document.querySelectorAll(".subtab-panel").forEach(panel => {
            panel.style.marginBottom = "";
        });
        
        // Load active subtab panel view
        const activeSubtab = appState.activeProjectTab || "general-info";
        
        // Update active class on tab buttons
        document.querySelectorAll(".subnav-tab-item").forEach(btn => {
            if (btn.getAttribute("data-subtab") === activeSubtab) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
        
        // Update active class on panels
        document.querySelectorAll(".subtab-panel").forEach(panel => {
            panel.classList.remove("active");
        });
        
        const activePanel = document.getElementById(`subtab-${activeSubtab}-view`);
        if (activePanel) {
            activePanel.classList.add("active");
        }
        
        // Render view based on active tab
        if (activeSubtab === "general-info") {
            renderSubnavGeneralInfo(project);
        } else if (activeSubtab === "cost-tab") {
            renderSubnavCostTab(project);
        } else if (activeSubtab === "documents-tab") {
            renderSubnavDocumentsTab(project);
        } else if (activeSubtab === "photos-files") {
            renderSubnavPhotosFiles(project);
        } else if (activeSubtab === "daily-report") {
            renderSubnavDailyReports(project);
        } else if (activeSubtab === "actual-progress") {
            renderSubnavActualProgress(project);
        } else if (activeSubtab === "plan-work") {
            renderSubnavPlanWork(project);
        }
    }

    // Auto-scroll on initial load if specified by share link
    if (window.shouldScrollToTab) {
        const tabToScroll = window.shouldScrollToTab;
        window.shouldScrollToTab = null; // Clear so it only triggers once
        setTimeout(() => {
            const targetPanel = document.getElementById(`subtab-${tabToScroll}-view`);
            if (targetPanel && targetPanel.classList.contains("active")) {
                targetPanel.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 600); // 600ms to allow all rendering (Gantt, S-Curve, daily reports) to complete
    }
}
