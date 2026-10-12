

function renderQuotingStorageView(project) {
    const isQuotingTab = (appState.currentView === "quoting-projects-list");
    const stdContainer = document.getElementById("standard-project-info-container");
    const quoteContainer = document.getElementById("quoting-project-info-container");
    const subnavTabsEl = document.querySelector(".subnav-tabs");

    if (subnavTabsEl) {
        subnavTabsEl.style.display = isQuotingTab ? "none" : "";
    }

    if (!isQuotingTab) {
        if (stdContainer) stdContainer.style.display = "block";
        if (quoteContainer) quoteContainer.style.display = "none";
        return;
    }

    if (stdContainer) stdContainer.style.display = "none";
    if (quoteContainer) quoteContainer.style.display = "block";

    // Summary Card Details
    const nameEl = document.getElementById("quoting-detail-name");
    const hospBadge = document.getElementById("quoting-detail-hospital-badge");
    const statusBadge = document.getElementById("quoting-detail-status-badge");
    const sumName = document.getElementById("quoting-summary-name");
    const sumHosp = document.getElementById("quoting-summary-hospital");
    const sumProgText = document.getElementById("quoting-summary-progress-text");
    const sumProgBar = document.getElementById("quoting-summary-progress-bar");

    if (project && project.code !== "all") {
        if (nameEl) nameEl.textContent = project.name;
        if (hospBadge) hospBadge.textContent = project.customer;
        if (statusBadge) statusBadge.textContent = "🟢 " + (project.status || "งานที่กำลังเสนอราคา");
        if (sumName) sumName.textContent = project.name;
        if (sumHosp) sumHosp.textContent = project.customer;
        if (sumProgText) sumProgText.textContent = `${project.progress || 0}%`;
        if (sumProgBar) sumProgBar.style.width = `${project.progress || 0}%`;
    } else {
        if (nameEl) nameEl.textContent = "ภาพรวมรายการเสนอราคาทั้งหมด";
        if (hospBadge) hospBadge.textContent = "ทุกโรงพยาบาล";
        if (statusBadge) statusBadge.textContent = "🟢 งานที่กำลังเสนอราคา";
        if (sumName) sumName.textContent = "เลือกรายการทางด้านซ้ายเพื่อดูรายละเอียด";
        if (sumHosp) sumHosp.textContent = "-";
        if (sumProgText) sumProgText.textContent = "0%";
        if (sumProgBar) sumProgBar.style.width = "0%";
    }

    // Populate Data Storage Table
    const tbody = document.getElementById("quoting-storage-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const hospitalVal = document.getElementById("subnav-hospital-selector") ? document.getElementById("subnav-hospital-selector").value : "all";
    const yearVal = document.getElementById("subnav-year-filter") ? document.getElementById("subnav-year-filter").value : "all";

    const quotingProjects = Object.values(projectsData).filter(p => {
        const hMatch = hospitalVal === "all" || p.customer === hospitalVal;
        const yMatch = yearVal === "all" || p.year === parseInt(yearVal);
        const qMatch = p.status === "งานที่กำลังเสนอราคา" || p.status === "กำลังเสนอราคา" || p.status === "งานที่รอเสนอราคา";
        return hMatch && yMatch && qMatch;
    });

    if (quotingProjects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: var(--text-muted); padding: 24px;">ไม่พบรายการเสนอราคาในระบบ</td></tr>`;
        return;
    }

    quotingProjects.forEach((p, index) => {
        const isSelected = p.code === appState.selectedDetailProject;
        const tr = document.createElement("tr");
        tr.style.background = isSelected ? "#f0f9ff" : "transparent";
        tr.style.cursor = "pointer";
        tr.onclick = function() {
            appState.selectedDetailProject = p.code;
            const pSelect = document.getElementById("subnav-project-selector");
            if (pSelect) pSelect.value = p.code;
            renderSubnavProjectWorkspace();
        };

        const formatDate = (isoStr) => {
            if (!isoStr) return `<span style="color: var(--text-muted); font-size: 11px;">-</span>`;
            const parts = isoStr.split("-");
            if (parts.length === 3) return `<span style="font-weight: 600; color: var(--navy-dark);">${parts[2]}/${parts[1]}/${parts[0]}</span>`;
            return isoStr;
        };
        const siteVisitDateDisplay = formatDate(p.siteVisitDate);
        
        let boqHtml = `<span style="color: var(--text-muted);">-</span>`;
        if (p.boqFileBase64 && p.boqFileName) {
            boqHtml = `<button class="btn btn-xs btn-outline btn-download-boq-list" data-url="${p.boqFileBase64}" data-file="${p.boqFileName}" style="font-size: 11px; padding: 2px 6px; color: #dc2626; border-color: #fca5a5; background: #fef2f2; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;" onclick="event.stopPropagation();"><i class="fa-solid fa-file-pdf"></i> ดาวน์โหลด</button>`;
        }
        
        let comp1Html = `<span style="color: var(--text-muted);">-</span>`;
        if (p.comparison1) {
            let url = p.comparison1;
            if (!/^https?:\/\//i.test(url)) url = "https://" + url;
            comp1Html = `<a href="${url}" target="_blank" class="btn btn-xs btn-outline" style="font-size: 11px; padding: 2px 6px; color: #2563eb; border-color: #93c5fd; background: #eff6ff; display: inline-flex; align-items: center; gap: 4px;" onclick="event.stopPropagation();"><i class="fa-solid fa-link"></i> ลิงก์</a>`;
        }
        
        let comp2Html = `<span style="color: var(--text-muted);">-</span>`;
        if (p.comparison2) {
            let url = p.comparison2;
            if (!/^https?:\/\//i.test(url)) url = "https://" + url;
            comp2Html = `<a href="${url}" target="_blank" class="btn btn-xs btn-outline" style="font-size: 11px; padding: 2px 6px; color: #2563eb; border-color: #93c5fd; background: #eff6ff; display: inline-flex; align-items: center; gap: 4px;" onclick="event.stopPropagation();"><i class="fa-solid fa-link"></i> ลิงก์</a>`;
        }

        let remarksHtml = `<span style="color: var(--text-muted); font-size: 11.5px;">-</span>`;
        if (p.remarks) {
            remarksHtml = `<span style="color: var(--navy-medium); font-weight: 500;">${p.remarks}</span>`;
        }

        tr.innerHTML = `
            <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: var(--text-muted);">${index + 1}</td>
            <td style="padding: 10px 12px; text-align: center;">${siteVisitDateDisplay}</td>
            <td style="padding: 10px 12px; font-weight: 700; color: var(--navy-dark); text-align: center;">${p.code}</td>
            <td style="padding: 10px 12px;">
                <strong style="color: var(--navy-dark); font-size: 12.5px;">${p.name.replace(/ \(\d{4}\)$/, '')}</strong>
                <div style="font-size: 10.5px; color: var(--text-muted);">${p.customer || "-"}</div>
            </td>
            <td style="padding: 10px 12px; text-align: center;">${boqHtml}</td>
            <td style="padding: 10px 12px; text-align: center;">${comp1Html}</td>
            <td style="padding: 10px 12px; text-align: center;">${comp2Html}</td>
            <td style="padding: 10px 12px; font-size: 11.5px; line-height: 1.4; max-width: 200px; word-wrap: break-word; white-space: normal;">${remarksHtml}</td>
            <td style="padding: 10px 12px; text-align: center;" onclick="event.stopPropagation();">
                <button class="btn btn-sm btn-outline" style="font-size: 10.5px; padding: 2px 8px;" onclick="appState.selectedDetailProject='${p.code}'; document.getElementById('open-edit-project-btn').click();">
                    <i class="fa-solid fa-pen-to-square"></i> แก้ไข
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-download-boq-list").forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.stopPropagation();
            const fileUrl = this.getAttribute("data-url");
            const fileName = this.getAttribute("data-file");
            if (window.downloadFileFromSupabase) {
                window.downloadFileFromSupabase(fileUrl, fileName);
            }
        });
    });
}

function renderSubnavGeneralInfo(project) {
    if (!document.getElementById("detail-info-code")) return;
    if (appState.currentView === "quoting-projects-list") {
        renderQuotingStorageView(project);
        return;
    }
    renderQuotingStorageView(project);

    // Project Info Card
    const codeEl = document.getElementById("detail-info-code");
    const yearEl = document.getElementById("detail-info-year");
    const nameEl = document.getElementById("detail-info-name");
    const hospitalEl = document.getElementById("detail-info-hospital");
    const managerEl = document.getElementById("detail-info-manager");
    const progressTextEl = document.getElementById("detail-info-progress-text");
    const progressBarEl = document.getElementById("detail-info-progress-bar");

    if (codeEl) codeEl.textContent = project.code || "-";
    if (yearEl) yearEl.textContent = project.year ? `${project.year + 543} (ค.ศ. ${project.year})` : "-";
    if (nameEl) nameEl.textContent = project.name || "-";
    if (hospitalEl) hospitalEl.textContent = project.customer || "-";
    if (managerEl) managerEl.textContent = project.manager || "-";
    
    const actualProgress = project.progress || 0;
    if (progressTextEl) progressTextEl.textContent = `${actualProgress}%`;
    if (progressBarEl) progressBarEl.style.width = `${actualProgress}%`;
    
    // Financial cards
    document.getElementById("detail-fin-cost").textContent = formatNumber(project.cost);
    document.getElementById("detail-fin-profit").textContent = formatNumber(project.profit);
    document.getElementById("detail-fin-netprofit").textContent = formatNumber(project.profit);
    
    // Render Project Bar Chart (system breakdown)
    renderSubnavProjectBarChart(project.workBreakdown);
    
    // Render Project Donut Chart (status breakdown)
    renderSubnavProjectDonutChart(project.jobs.inprogress, project.jobs.completed, project.jobs.delayed);
    
    // Render Yearly Comparison Chart (Planned vs Actual progress across years)
    renderSubnavYearlyComparisonChart(project.customer);

    // Render Project Detail Permissions
    if (appState.currentRole === "pm" || appState.currentRole === "admin") {
        const card = document.querySelector(".project-permissions-card");
        if (card) card.style.display = "block";
        renderProjectPermissions(project);
    } else {
        const card = document.querySelector(".project-permissions-card");
        if (card) card.style.display = "none";
    }
}

function renderProjectPermissions(project) {
    const tbody = document.getElementById("project-detail-permissions-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const accounts = appState.customerAccounts || {};
    const projectCode = project.code;

    // Filter accounts to target roles: customer, pe, technician, tech (defaulting undefined role to "customer")
    const targetRoles = ["customer", "pe", "technician", "tech"];
    const allTargetAccounts = Object.values(accounts).filter(acc => targetRoles.includes(acc.role || "customer"));

    // Accounts that currently have access (either via project or hospital)
    const accessAccounts = allTargetAccounts.filter(acc => {
        const userKey = acc.userKey;
        const perms = appState.userPermissions[userKey] || { hospitals: [], projects: [] };
        const hasProjectPerm = perms.projects && perms.projects.includes(projectCode);
        const hasHospitalPerm = perms.hospitals && perms.hospitals.includes(project.customer);
        return hasProjectPerm || hasHospitalPerm;
    });

    // Accounts that DO NOT have access yet (to populate dropdown)
    const nonAccessAccounts = allTargetAccounts.filter(acc => {
        const userKey = acc.userKey;
        const perms = appState.userPermissions[userKey] || { hospitals: [], projects: [] };
        const hasProjectPerm = perms.projects && perms.projects.includes(projectCode);
        const hasHospitalPerm = perms.hospitals && perms.hospitals.includes(project.customer);
        return !hasProjectPerm && !hasHospitalPerm;
    });

    // 1. Populate Dropdown Select (Searchable Dropdown)
    const searchInput = document.getElementById("project-detail-user-search-input");
    const dropdownContainer = document.getElementById("project-detail-user-search-dropdown");
    const chevronIcon = document.getElementById("project-detail-user-search-chevron");

    if (searchInput && dropdownContainer) {
        // Reset state on project change
        if (!window.projectDetailSearchInitted) {
            window.projectDetailSearchInitted = true;
            
            // Toggle dropdown open on focus / click
            searchInput.addEventListener("focus", () => {
                renderSearchDropdownItems();
                dropdownContainer.style.display = "block";
            });

            // Input event for live filter
            searchInput.addEventListener("input", () => {
                renderSearchDropdownItems(searchInput.value.trim());
                dropdownContainer.style.display = "block";
            });

            // Toggle dropdown on chevron click
            if (chevronIcon) {
                chevronIcon.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const isVisible = dropdownContainer.style.display === "block";
                    if (isVisible) {
                        dropdownContainer.style.display = "none";
                    } else {
                        renderSearchDropdownItems();
                        dropdownContainer.style.display = "block";
                        searchInput.focus();
                    }
                });
            }

            // Close when clicking outside
            document.addEventListener("click", (e) => {
                if (!e.target.closest("#project-detail-user-search-input") && 
                    !e.target.closest("#project-detail-user-search-dropdown") &&
                    !e.target.closest("#project-detail-user-search-chevron")) {
                    dropdownContainer.style.display = "none";
                }
            });
        }

        // Store non-access accounts in window variable for the event listeners to access
        window.activeNonAccessAccounts = nonAccessAccounts;

        if (nonAccessAccounts.length === 0) {
            searchInput.disabled = true;
            searchInput.value = "";
            searchInput.placeholder = "ไม่มีผู้ใช้ให้เลือก";
            window.selectedUserKeyToAssign = null;
        } else {
            searchInput.disabled = false;
            searchInput.placeholder = "พิมพ์ค้นหาบัญชีผู้ใช้...";
            // Clear current input value only if we changed to a different project or if no user is selected yet
            if (window.lastDetailProjectCode !== projectCode) {
                searchInput.value = "";
                window.selectedUserKeyToAssign = null;
                window.lastDetailProjectCode = projectCode;
            }
        }
    }

    // Helper to render items dynamically
    function renderSearchDropdownItems(filterText = "") {
        dropdownContainer.innerHTML = "";
        const list = window.activeNonAccessAccounts || [];
        
        const filtered = list.filter(acc => {
            const name = (acc.name || "").toLowerCase();
            const username = (acc.username || "").toLowerCase();
            const term = filterText.toLowerCase();
            return name.includes(term) || username.includes(term);
        });

        if (filtered.length === 0) {
            const div = document.createElement("div");
            div.style.padding = "8px 12px";
            div.style.fontSize = "11.5px";
            div.style.color = "var(--text-muted)";
            div.style.fontStyle = "italic";
            div.textContent = "ไม่พบผู้ใช้ที่ค้นหา";
            dropdownContainer.appendChild(div);
        } else {
            filtered.forEach(acc => {
                const item = document.createElement("div");
                item.style.padding = "8px 12px";
                item.style.fontSize = "11.5px";
                item.style.cursor = "pointer";
                item.style.borderBottom = "1px solid var(--border-color)";
                item.style.fontFamily = "'Prompt'";
                item.style.fontWeight = "600";
                item.style.color = "var(--navy-dark)";
                item.style.transition = "background 0.15s";
                
                // Hover effect
                item.onmouseover = () => item.style.background = "#f1f5f9";
                item.onmouseout = () => item.style.background = "transparent";

                let roleLabel = "";
                const r = acc.role || "customer";
                if (r === "customer") roleLabel = "ลูกค้า";
                else if (r === "pe") roleLabel = "PE";
                else roleLabel = "ช่าง";
                
                const labelText = `${acc.name || acc.username} (${roleLabel} - @${acc.username})`;
                item.textContent = labelText;
                
                // Click handler to select
                item.addEventListener("click", () => {
                    searchInput.value = labelText;
                    window.selectedUserKeyToAssign = acc.userKey;
                    dropdownContainer.style.display = "none";
                });
                
                dropdownContainer.appendChild(item);
            });
        }
    }

    // 2. Render Table rows
    if (accessAccounts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px; font-style: italic;">ยังไม่มีผู้ได้รับสิทธิ์เข้าถึงโครงการนี้</td></tr>`;
        return;
    }

    accessAccounts.forEach(acc => {
        const userKey = acc.userKey;
        const perms = appState.userPermissions[userKey] || { hospitals: [], projects: [] };
        
        const hasProjectPerm = perms.projects && perms.projects.includes(projectCode);
        const hasHospitalPerm = perms.hospitals && perms.hospitals.includes(project.customer);

        let roleLabel = "";
        let roleColor = "";
        let roleIcon = "";
        const roleStr = acc.role || "customer";
        
        if (roleStr === "customer") {
            roleLabel = "ลูกค้า (Customer)";
            roleColor = "#0284c7";
            roleIcon = "fa-user-tie";
        } else if (roleStr === "pe") {
            roleLabel = "วิศวกร (PE)";
            roleColor = "#16a34a";
            roleIcon = "fa-helmet-safety";
        } else {
            roleLabel = "ช่าง (Technician)";
            roleColor = "#ea580c";
            roleIcon = "fa-screwdriver-wrench";
        }

        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid var(--border-color)";
        
        let sourceHTML = "";
        if (hasHospitalPerm) {
            sourceHTML = `
                <div style="display: flex; justify-content: center; align-items: center;">
                    <span style="font-size: 11px; color: #16a34a; font-weight: 700; background: #dcfce7; padding: 4px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-hospital"></i> รายโรงพยาบาล
                    </span>
                </div>
            `;
        } else {
            sourceHTML = `
                <div style="display: flex; justify-content: center; align-items: center;">
                    <span style="font-size: 11px; color: #2563eb; font-weight: 700; background: #eff6ff; padding: 4px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-file-contract"></i> รายโครงการ
                    </span>
                </div>
            `;
        }

        const deleteButtonHTML = `
            <div style="display: flex; justify-content: center; align-items: center;">
                <button type="button" onclick="window.revokeUserProjectAccess('${userKey}')" class="btn btn-xs" style="background: #fee2e2; color: #ef4444; border: 1px solid #fca5a5; padding: 4px 8px; border-radius: 4px; font-family: 'Prompt'; font-size: 11px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; justify-content: center; transition: all 0.2s; font-weight: 700;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                    <i class="fa-solid fa-trash-can" style="font-size: 10px;"></i> ลบสิทธิ์
                </button>
            </div>
        `;

        tr.innerHTML = `
            <td style="padding: 10px 12px; font-weight: 600; color: var(--navy-dark);">${acc.name || acc.username}</td>
            <td style="padding: 10px 12px; font-family: monospace; font-weight: 600; color: #475569;">${acc.username}</td>
            <td style="padding: 10px 12px;">
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: ${roleColor}; background: ${roleColor}15; padding: 4px 10px; border-radius: 20px;">
                    <i class="fa-solid ${roleIcon}"></i> ${roleLabel}
                </span>
            </td>
            <td style="padding: 10px 12px; text-align: center;">${sourceHTML}</td>
            <td style="padding: 10px 12px; text-align: center;">${deleteButtonHTML}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Function to add an existing user selected from the dropdown to this project
window.addExistingUserToProject = async function() {
    const userKey = window.selectedUserKeyToAssign;
    if (!userKey) {
        showToast("กรุณาเลือกผู้ใช้จากในรายการก่อนมอบสิทธิ์", "warning");
        return;
    }

    const project = projectsData[appState.selectedDetailProject];
    if (!project) return;
    const projectCode = project.code;

    if (!appState.userPermissions) appState.userPermissions = {};
    if (!appState.userPermissions[userKey]) {
        appState.userPermissions[userKey] = { hospitals: [], projects: [] };
    }

    let projects = appState.userPermissions[userKey].projects || [];
    if (!projects.includes(projectCode)) {
        projects.push(projectCode);
    }
    appState.userPermissions[userKey].projects = projects;

    await saveUserPermissions();
    showToast("มอบสิทธิ์การเข้าถึงให้ผู้ใช้ที่เลือกเรียบร้อยแล้ว", "success");

    // Clear search and selection state
    window.selectedUserKeyToAssign = null;
    const searchInput = document.getElementById("project-detail-user-search-input");
    if (searchInput) searchInput.value = "";

    // Re-render
    renderProjectPermissions(project);
    if (appState.currentView === "permissions-mgmt") {
        renderPermissionsManagement();
    }
};

// Function to revoke project or hospital access
window.revokeUserProjectAccess = async function(userKey) {
    const project = projectsData[appState.selectedDetailProject];
    if (!project) return;
    const projectCode = project.code;
    const hospitalName = project.customer;

    const acc = appState.customerAccounts[userKey];
    const dispName = acc ? (acc.name || acc.username) : "ผู้ใช้";

    if (!appState.userPermissions) appState.userPermissions = {};
    const perms = appState.userPermissions[userKey] || { hospitals: [], projects: [] };

    const hasProjectPerm = perms.projects && perms.projects.includes(projectCode);
    const hasHospitalPerm = perms.hospitals && perms.hospitals.includes(hospitalName);

    if (hasHospitalPerm) {
        const confirmMsg = `⚠️ ผู้ใช้ "${dispName}" มีสิทธิ์ระดับ "รายโรงพยาบาล" (${hospitalName})\n\nการลบสิทธิ์หน้าโครงการนี้จะเป็นการลบสิทธิ์เข้าถึงโรงพยาบาลนี้ทั้งหมดของผู้ใช้รายนี้\nคุณต้องการดำเนินการลบสิทธิ์ต่อหรือไม่?`;
        if (!confirm(confirmMsg)) return;
        perms.hospitals = (perms.hospitals || []).filter(h => h !== hospitalName);
    }

    if (hasProjectPerm) {
        perms.projects = (perms.projects || []).filter(p => p !== projectCode);
    }

    appState.userPermissions[userKey] = perms;

    await saveUserPermissions();
    showToast(`ลบสิทธิ์การเข้าถึงของ "${dispName}" สำเร็จแล้ว`, "success");

    // Re-render
    renderProjectPermissions(project);
    if (appState.currentView === "permissions-mgmt") {
        renderPermissionsManagement();
    }
};

function calculatePlanScurveFromGantt(proj) {
    if (!proj || !proj.ganttData || !proj.ganttData.tasks || !proj.ganttData.startDate || !proj.ganttData.endDate) return;
    if (!proj.scurveData || proj.scurveData.length === 0) return;

    const viewMode = proj.scurveViewMode || "weekly";
    
    // Calculate dates list from Gantt chart start/end dates
    const [sy, sm, sd] = proj.ganttData.startDate.split('-').map(Number);
    const [ey, em, ed] = proj.ganttData.endDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    const dateList = [];
    let current = new Date(start);
    let safety = 0;
    while (current <= end && safety < 1000) {
        dateList.push(formatDateLocal(current));
        current.setDate(current.getDate() + 1);
        safety++;
    }
    
    const totalDays = dateList.length;
    if (totalDays === 0) return;

    let numPeriods = 0;
    let interval = 1;
    if (viewMode === "daily") {
        numPeriods = totalDays;
        interval = 1;
    } else {
        if (!proj.scurveMonths || proj.scurveMonths.length === 0) return;
        numPeriods = proj.scurveMonths.length * 4;
        interval = totalDays / numPeriods;
    }

    // Map each scurveData item to corresponding task in Gantt by name
    proj.scurveData.forEach(item => {
        const task = proj.ganttData.tasks.find(t => 
            t.rowType === 'task' && 
            t.name && item.name && 
            t.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        );

        // Reset plan array
        if (viewMode === "daily") {
            item.planDays = new Array(numPeriods).fill(0);
        } else {
            item.plan = new Array(numPeriods).fill(0);
        }

        if (task && task.cells) {
            // Count total active days
            let activeDays = 0;
            dateList.forEach(dStr => {
                const val = task.cells[dStr];
                let noise = 0;
                if (val) {
                    if (typeof val === 'object') {
                        noise = val.noise || 0;
                    } else {
                        noise = parseInt(val) || 0;
                    }
                }
                if (noise > 0) {
                    activeDays++;
                }
            });

            if (activeDays > 0) {
                // Distribute progress across periods
                dateList.forEach((dStr, dIdx) => {
                    const val = task.cells[dStr];
                    let noise = 0;
                    if (val) {
                        if (typeof val === 'object') {
                            noise = val.noise || 0;
                        } else {
                            noise = parseInt(val) || 0;
                        }
                    }
                    if (noise > 0) {
                        let pIdx = Math.floor(dIdx / interval);
                        if (pIdx >= numPeriods) pIdx = numPeriods - 1;
                        if (viewMode === "daily") {
                            item.planDays[pIdx] += (1 / activeDays) * 100;
                        } else {
                            item.plan[pIdx] += (1 / activeDays) * 100;
                        }
                    }
                });

                // Round and check sums
                let sum = 0;
                const arr = viewMode === "daily" ? item.planDays : item.plan;
                for (let p = 0; p < numPeriods; p++) {
                    arr[p] = Math.round(arr[p] * 10) / 10;
                    sum += arr[p];
                }
                const diff = 100 - sum;
                if (Math.abs(diff) > 0.01 && Math.abs(diff) < 5) {
                    // Adjust last active period
                    let lastActiveP = -1;
                    for (let p = numPeriods - 1; p >= 0; p--) {
                        if (arr[p] > 0) {
                            lastActiveP = p;
                            break;
                        }
                    }
                    if (lastActiveP !== -1) {
                        arr[lastActiveP] = Math.round((arr[lastActiveP] + diff) * 10) / 10;
                    }
                }
            }
        }
    });
}


function formatBudgetInput(input) {
    let cursor = input.selectionStart;
    let oldLength = input.value.length;
    
    // กรองเอาเฉพาะตัวเลข
    let val = input.value.replace(/[^0-9]/g, "");
    if (!val) {
        input.value = "";
        return;
    }
    
    // ใส่เครื่องหมายจุลภาค (ลูกน้ำ)
    let formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    input.value = formatted;
    
    // รักษาตำแหน่งเคอร์เซอร์การพิมพ์
    let newLength = formatted.length;
    let diff = newLength - oldLength;
    input.setSelectionRange(cursor + diff, cursor + diff);
}

function syncScurveDOMToObject(proj) {
    if (!proj || !proj.scurveData) return;
    const viewMode = proj.scurveViewMode || "weekly";
    const monthInputs = document.querySelectorAll('.scurve-month-name');
    if (monthInputs && monthInputs.length > 0 && viewMode !== "daily") {
        proj.scurveMonths = Array.from(monthInputs).map(inp => inp.value.trim() || 'Month');
    }
    proj.scurveData.forEach((item, idx) => {
        const itemEl = document.querySelector(`.scurve-item-num[data-idx="${idx}"]`);
        const nameEl = document.querySelector(`.scurve-item-name[data-idx="${idx}"]`);
        const budgetEl = document.querySelector(`.scurve-budget[data-idx="${idx}"]`);
        const weightEl = document.querySelector(`.scurve-weight[data-idx="${idx}"]`);
        if (nameEl) item.name = nameEl.value.trim();
        if (!item.isSubtask) {
            if (itemEl) item.item = itemEl.value.trim();
            if (budgetEl) item.budget = parseFloat(budgetEl.value.replace(/,/g, "")) || 0;
            if (weightEl) item.weight = parseFloat(weightEl.value) || 0;
        }
        const cellVals = document.querySelectorAll(`.scurve-cell-val[data-idx="${idx}"]`);
        cellVals.forEach(cell => {
            const wIdx = parseInt(cell.getAttribute('data-widx'));
            const val = parseFloat(cell.value) || 0;
            if (viewMode === "daily") {
                if (currentScurveMode === 'plan') {
                    if (!item.planDays) item.planDays = [];
                    item.planDays[wIdx] = val;
                } else {
                    if (!item.actualDays) item.actualDays = [];
                    item.actualDays[wIdx] = val;
                }
            } else {
                if (currentScurveMode === 'plan') {
                    if (!item.plan) item.plan = [];
                    item.plan[wIdx] = val;
                } else {
                    if (!item.actual) item.actual = [];
                    item.actual[wIdx] = val;
                }
            }
        });
    });
    // Sync cumulative plan values
    const planCumVals = document.querySelectorAll('.scurve-plan-cum-val');
    if (planCumVals && planCumVals.length > 0) {
        if (viewMode === "daily") {
            if (!proj.scurvePlanCumDays) proj.scurvePlanCumDays = [];
            planCumVals.forEach(cell => {
                const wIdx = parseInt(cell.getAttribute('data-widx'));
                const val = parseFloat(cell.value) || 0;
                proj.scurvePlanCumDays[wIdx] = val;
            });
        } else {
            if (!proj.scurvePlanCum) proj.scurvePlanCum = [];
            planCumVals.forEach(cell => {
                const wIdx = parseInt(cell.getAttribute('data-widx'));
                const val = parseFloat(cell.value) || 0;
                proj.scurvePlanCum[wIdx] = val;
            });
        }
    }
}

function updateScurveTotals(project) {
    const foot = document.getElementById("scurve-table-foot");
    if (!foot || !project.scurveData || !project.scurveMonths) return;

    let totalBudget = 0;
    let totalWeight = 0;
    
    // Calculate total budget first
    project.scurveData.forEach(item => {
        if (!item.isSubtask) {
            totalBudget += parseFloat(item.budget) || 0;
        }
    });

    // Calculate and update each item's weight in real-time
    project.scurveData.forEach((item, idx) => {
        if (!item.isSubtask) {
            item.weight = totalBudget > 0 ? (item.budget / totalBudget) * 100 : 0;
            totalWeight += item.weight;
        } else {
            item.weight = 0;
        }
        
        // Update DOM weight field if present
        const weightInput = document.querySelector(`.scurve-weight[data-idx="${idx}"]`);
        if (weightInput) {
            weightInput.value = (item.weight || 0).toFixed(2);
        }
    });
    
    let planWeeklySums = new Array(project.scurveMonths.length * 4).fill(0);
    let actualWeeklySums = new Array(project.scurveMonths.length * 4).fill(0);

    let currentParentWeight = 0;
    let lastActualIndex = -1;
    project.scurveData.forEach(item => {
        if (!item.isSubtask) {
            currentParentWeight = parseFloat(item.weight) || 0;
        }
        
        for (let i = 0; i < planWeeklySums.length; i++) {
            let pVal = parseFloat(item.plan ? item.plan[i] : 0) || 0;
            let hasActualData = (item.actual && item.actual[i] !== undefined && item.actual[i] !== null && item.actual[i] !== '' && item.actual[i] !== '-' && !isNaN(parseFloat(item.actual[i])) && parseFloat(item.actual[i]) > 0);
            let aVal = hasActualData ? (parseFloat(item.actual[i]) || 0) : 0;

            planWeeklySums[i] += (currentParentWeight * pVal / 100);
            actualWeeklySums[i] += (currentParentWeight * aVal / 100);

            if (hasActualData && i > lastActualIndex) {
                lastActualIndex = i;
            }
        }
    });

    let displayWeeklySums = actualWeeklySums; // Always display actual weekly sums
    
    const hideBudget = (appState.currentRole === "pe" || appState.currentRole === "customer" || appState.currentRole === "technician" || appState.currentRole === "tech");
    const hideWeight = (appState.currentRole === "customer");
    const labelColspan = 2 + (hideBudget ? 0 : 1) + (hideWeight ? 0 : 1) + 1;

    let footerHtml = ``;
    if (!hideWeight) {
        footerHtml += `
            <tr style="background: #f8fafc; font-weight: 700; border-top: 2px solid var(--border-color);">
                <td colspan="2" style="padding: 8px 10px; text-align: right;">รวม</td>
                ${hideBudget ? '' : `<td style="padding: 8px 4px; text-align: center;">${totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>`}
                <td style="padding: 8px 4px; text-align: center; color: ${totalWeight === 100 ? '#10b981' : '#e63946'};">${totalWeight.toFixed(2)}%</td>
                <td style="padding: 8px 4px; text-align: center;"></td>
        `;
        displayWeeklySums.forEach((val, i) => {
            footerHtml += `<td style="padding: 8px 4px; border-left: ${i%4===0 ? '1px' : '0'} solid var(--border-color);"></td>`;
        });
        footerHtml += `<td class="hide-accounting hide-customer"></td></tr>`;
    }

    footerHtml += `
        <tr style="background: #fff; border-top: 1px solid var(--border-color);">
            <td colspan="${labelColspan}" style="padding: 8px 10px; text-align: right; font-weight: 600;">ปริมาณงานต่อสัปดาห์ (%)</td>
    `;
    displayWeeklySums.forEach((val, i) => {
        const cellText = (i <= lastActualIndex) ? (val === 0 ? '0.00%' : val.toFixed(2)+'%') : '';
        footerHtml += `<td style="padding: 8px 4px; text-align: center; font-size: 10px; border-left: ${i%4===0 ? '1px' : '0'} solid var(--border-color); min-width: 45px; width: 45px;">${cellText}</td>`;
    });
    footerHtml += `<td class="hide-accounting hide-customer"></td></tr>`;
    
    const hideActualCumRow = true;
    if (!hideActualCumRow) {
        footerHtml += `
            <tr style="background: #f1f5f9; border-top: 1px solid var(--border-color); font-weight: 700;">
                <td colspan="${labelColspan}" style="padding: 8px 10px; text-align: right;">สะสมปริมาณงาน (%)</td>
        `;
        let cumSum = 0;
        displayWeeklySums.forEach((val, i) => {
            cumSum += val;
            footerHtml += `<td style="padding: 8px 4px; text-align: center; font-size: 10px; border-left: ${i%4===0 ? '1px' : '0'} solid var(--border-color); color: var(--primary-blue);">${cumSum === 0 ? '0.0%' : cumSum.toFixed(1)+'%'}</td>`;
        });
        footerHtml += `<td class="hide-accounting hide-customer"></td></tr>`;
    }

    // Add manually editable cumulative plan progress row
    const canEditPlan = (appState.currentRole === "pm" || appState.currentRole === "admin" || appState.currentRole === "pe") && appState.selectedDetailProject !== "all";
    const planReadonlyAttr = canEditPlan ? '' : 'readonly';
    const planEditInputStyle = `style="width: 100%; font-size: 10px; text-align: center; padding: 3px 2px; border: 1px solid var(--border-color); border-radius: 4px; background: #fff; color: #1e40af; font-weight: bold;"`;
    const planInputStyle = `style="width: 100%; font-size: 10px; text-align: center; padding: 3px 2px; border: 1px solid transparent; background: transparent; color: #1e40af; font-weight: bold;"`;

    footerHtml += `
        <tr style="background: #eef2f6; border-top: 1px solid var(--border-color); font-weight: 700;">
            <td colspan="${labelColspan}" style="padding: 8px 10px; text-align: right; color: #1e40af;">เป้าหมายแผนงาน</td>
    `;
    
    if (!project.scurvePlanCum) project.scurvePlanCum = new Array(project.scurveMonths.length * 4).fill(0);
    while (project.scurvePlanCum.length < project.scurveMonths.length * 4) project.scurvePlanCum.push(0);

    project.scurvePlanCum.forEach((val, i) => {
        let valStr = val === 0 ? '' : val;
        footerHtml += `<td style="padding: 4px; border-left: ${i%4===0 ? '1px' : '0'} solid var(--border-color); min-width: 45px; width: 45px;">
            <input type="number" class="scurve-plan-cum-val" data-widx="${i}" value="${valStr}" min="0" max="100" step="0.1" ${planReadonlyAttr} ${canEditPlan ? planEditInputStyle : planInputStyle} placeholder="">
        </td>`;
    });
    footerHtml += `<td class="hide-accounting hide-customer"></td></tr>`;
    
    foot.innerHTML = footerHtml;
}

function renderSCurveChart(project) {
    if (typeof Chart === "undefined") return;
    syncScurveMonthsWithGantt(project);
    
    const canvas = document.getElementById("scurve-chart-canvas");
    if (!canvas) return;
    
    try {
        const ctx = canvas.getContext("2d");
        if (scurveChartInstance) scurveChartInstance.destroy();
        
        if (!project.scurveData || project.scurveData.length === 0 || !project.scurveMonths) {
            scurveChartInstance = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#94a3b8";
            ctx.font = "13px 'Prompt', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("ยังไม่มีข้อมูลแผนงาน — เพิ่มรายการงานเพื่อดูกราฟ S-Curve", canvas.width / 2, canvas.height / 2);
            
            const pctEl = document.getElementById("scurve-latest-actual-percentage");
            if (pctEl) {
                pctEl.style.display = "none";
                pctEl.textContent = "0.0%";
            }
            return;
        }
        
        const isDaily = window.isProjectDailyMode(project);
        const numColumns = window.getScurveColumnsCount(project);

        let planWeeklySums = new Array(numColumns).fill(0);
        let actualWeeklySums = new Array(numColumns).fill(0);
        
        let currentParentWeight = 0;
        let lastActualIndex = -1;
        project.scurveData.forEach(item => {
            if (!item.isSubtask) {
                currentParentWeight = parseFloat(item.weight) || 0;
            }
            for (let i = 0; i < planWeeklySums.length; i++) {
                let pVal = parseFloat(item.plan ? item.plan[i] : 0) || 0;
                
                let hasActualData = (item.actual && item.actual[i] !== undefined && item.actual[i] !== null && item.actual[i] !== '' && item.actual[i] !== '-' && !isNaN(parseFloat(item.actual[i])) && parseFloat(item.actual[i]) > 0);
                let aVal = hasActualData ? (parseFloat(item.actual[i]) || 0) : 0;

                planWeeklySums[i] += (currentParentWeight * pVal / 100);
                actualWeeklySums[i] += (currentParentWeight * aVal / 100);

                if (hasActualData && i > lastActualIndex) {
                    lastActualIndex = i;
                }
            }
        });
        
        const cumPlan = [0];
        if (!project.scurvePlanCum) project.scurvePlanCum = new Array(numColumns).fill(0);
        while (project.scurvePlanCum.length < numColumns) project.scurvePlanCum.push(0);

        project.scurvePlanCum.forEach(val => {
            cumPlan.push(parseFloat(val) || 0);
        });

        const cumActual = [0];
        let ca = 0;
        for (let i = 0; i < actualWeeklySums.length; i++) {
            if (i <= lastActualIndex) {
                ca += actualWeeklySums[i];
                cumActual.push(parseFloat(ca.toFixed(2)));
            } else {
                cumActual.push(null);
            }
        }
        
        let latestActualCum = 0;
        if (lastActualIndex !== -1 && cumActual[lastActualIndex + 1] !== undefined && cumActual[lastActualIndex + 1] !== null) {
            latestActualCum = cumActual[lastActualIndex + 1];
        }
        
        const pctEl = document.getElementById("scurve-latest-actual-percentage");
        if (pctEl) {
            pctEl.textContent = `${latestActualCum.toFixed(1)}%`;
            pctEl.style.display = "block";
        }
        
        const labels = ["เริ่มต้น"];
        if (isDaily) {
            const [sy, sm, sd] = project.ganttData.startDate.split('-').map(Number);
            const [ey, em, ed] = project.ganttData.endDate.split('-').map(Number);
            const start = new Date(sy, sm - 1, sd);
            const end = new Date(ey, em - 1, ed);

            let current = new Date(start);
            let count = 0;
            const monthThaiShortNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
            while (current <= end && count < 750) {
                const day = current.getDate();
                const mShort = monthThaiShortNames[current.getMonth()];
                const yShort = (current.getFullYear() + 543).toString().substring(2);
                labels.push(`${day} ${mShort} ${yShort}`);
                current.setDate(current.getDate() + 1);
                count++;
            }
        } else {
            project.scurveMonths.forEach(m => {
                for (let w = 1; w <= 4; w++) {
                    labels.push(`${m} W${w}`);
                }
            });
        }
        
        scurveChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "แผนงานสะสม (Plan %)",
                        data: cumPlan,
                        borderColor: "#1d3557",
                        backgroundColor: "rgba(29,53,87,0.08)",
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 3,
                        pointBackgroundColor: "#1d3557"
                    },
                    {
                        label: "งานจริงสะสม (Actual %)",
                        data: cumActual,
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16,185,129,0.08)",
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 3,
                        pointBackgroundColor: "#10b981"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label.split(" (")[0] + ": " + context.raw.toFixed(1) + "%";
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: "Prompt", size: 11, weight: "600" }, maxRotation: 45, minRotation: 45 },
                        border: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        max: 115,
                        grace: 0,
                        border: { display: false },
                        grid: {
                            color: function(context) {
                                if (context.tick && context.tick.value > 100) {
                                    return 'transparent';
                                }
                                return 'rgba(0, 0, 0, 0.05)';
                            }
                        },
                        ticks: {
                            stepSize: 20,
                            font: { family: "Prompt", size: 11, weight: "600" },
                            callback: function(value) { 
                                if (value > 100) return "";
                                return value + "%"; 
                            }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error drawing S-Curve chart:", err);
    }
}

function deleteScurveRow(idx) {
    const project = projectsData[appState.selectedDetailProject];
    if (!project || !project.scurveData) return;
    
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการงานนี้?")) {
        const deleted = project.scurveData.splice(idx, 1);
        showToast(`ลบรายการงาน: ${deleted[0].name || 'ไม่มีชื่อ'} สำเร็จ!`, "success");
        saveToLocalStorage();
        renderSubnavActualProgress(project);
    }
}

function deletePlanDoc(idx) {
    const project = projectsData[appState.selectedDetailProject];
    if (!project) return;
    
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์แผนงานอ้างอิงนี้?")) {
        const deleted = project.planDocs.splice(idx, 1);
        showToast(`ลบไฟล์แผนงาน: ${deleted[0].title} สำเร็จ!`, "success");
        renderSubnavPlanWork(project);
    }
}

function renderSubnavPhotosFiles(project) {
    const grid = document.getElementById("project-media-gallery-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    const media = project.media || [];
    if (media.length === 0) {
        grid.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 40px 0;">ไม่มีรูปภาพหรือไฟล์อัปโหลดสำหรับโครงการนี้</div>`;
        return;
    }
    
    const thaiMonths = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    
    function getMonthYearSortKey(dateStr) {
        if (!dateStr) return "0000-00";
        const parts = dateStr.split("/");
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}`;
        }
        return "0000-00";
    }
    
    function formatSortKeyToThai(key) {
        if (key === "0000-00") return "อื่นๆ / ไม่ระบุวันที่";
        const parts = key.split("-");
        if (parts.length === 2) {
            const year = parts[0];
            const monthIdx = parseInt(parts[1], 10) - 1;
            if (monthIdx >= 0 && monthIdx < 12) {
                return `${thaiMonths[monthIdx]} ${year}`;
            }
        }
        return "ไม่ระบุเดือน";
    }
    
    // Group media items by YYYY-MM key
    const groups = {};
    media.forEach(item => {
        const sortKey = getMonthYearSortKey(item.date);
        if (!groups[sortKey]) {
            groups[sortKey] = [];
        }
        groups[sortKey].push(item);
    });
    
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    
    if (appState.selectedGalleryFolder === null) {
        // Render folder grid
        sortedKeys.forEach(key => {
            const folderLabel = formatSortKeyToThai(key);
            const itemCount = groups[key].length;
            
            const card = document.createElement("div");
            card.className = "gallery-folder-card";
            card.style.cssText = "border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 24px 16px; text-align: center; background: #fff; box-shadow: var(--card-shadow); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center;";
            card.innerHTML = `
                <i class="fa-solid fa-folder" style="font-size: 54px; color: #3b82f6; margin-bottom: 12px;"></i>
                <span style="font-weight: 600; font-size: 14.5px; color: var(--navy-dark); text-align: center; display: block; margin-bottom: 4px;">${folderLabel}</span>
                <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 500;">${itemCount} รูปภาพ</span>
            `;
            
            card.addEventListener("mouseenter", () => {
                card.style.transform = "translateY(-4px)";
                card.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
            });
            card.addEventListener("mouseleave", () => {
                card.style.transform = "translateY(0)";
                card.style.boxShadow = "var(--card-shadow)";
            });
            
            card.addEventListener("click", () => {
                appState.selectedGalleryFolder = key;
                renderSubnavPhotosFiles(project);
            });
            
            grid.appendChild(card);
        });
    } else {
        // Render images inside the selected folder
        const selectedKey = appState.selectedGalleryFolder;
        const folderLabel = formatSortKeyToThai(selectedKey);
        const folderItems = groups[selectedKey] || [];
        
        const canEdit = (appState.currentRole === "pm" || appState.currentRole === "admin" || appState.currentRole === "pe") && appState.selectedDetailProject !== "all";

        // 1. Back button header
        const header = document.createElement("div");
        header.style.cssText = "grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;";
        
        let headerHtml = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <button class="btn btn-sm btn-outline" id="gallery-back-to-folders" style="display: flex; align-items: center; gap: 6px; font-size: 12px; padding: 4px 10px; cursor: pointer; background: #fff; border: 1px solid var(--border-color); border-radius: 4px;">
                    <i class="fa-solid fa-chevron-left"></i> ย้อนกลับไปโฟลเดอร์
                </button>
        `;
        
        if (canEdit && folderItems.length > 0) {
            headerHtml += `
                <button class="btn btn-sm btn-outline-red" id="gallery-toggle-select" style="display: flex; align-items: center; gap: 6px; font-size: 12px; padding: 4px 10px; cursor: pointer; border-radius: 4px;">
                    <i class="fa-solid fa-square-check"></i> เลือกรูปภาพเพื่อลบ
                </button>
                <div id="gallery-delete-actions" style="display: none; align-items: center; gap: 10px;">
                    <button class="btn btn-sm btn-red" id="gallery-bulk-delete" style="display: flex; align-items: center; gap: 6px; font-size: 12px; padding: 4px 10px; cursor: pointer; border-radius: 4px;" disabled>
                        <i class="fa-solid fa-trash-can"></i> ลบรูปภาพที่เลือก (<span id="delete-selected-count">0</span>)
                    </button>
                    <button class="btn btn-sm btn-outline" id="gallery-cancel-select" style="display: flex; align-items: center; gap: 6px; font-size: 12px; padding: 4px 10px; cursor: pointer; background: #fff; border: 1px solid var(--border-color); border-radius: 4px;">
                        ยกเลิก
                    </button>
                </div>
            `;
        }

        headerHtml += `
            </div>
            <span style="font-weight: 600; font-size: 15px; color: var(--navy-dark);">โฟลเดอร์: ${folderLabel}</span>
        `;
        header.innerHTML = headerHtml;
        grid.appendChild(header);
        
        header.querySelector("#gallery-back-to-folders").addEventListener("click", () => {
            document.body.classList.remove("gallery-select-mode");
            appState.selectedGalleryFolder = null;
            renderSubnavPhotosFiles(project);
        });
        
        const updateBulkDeleteCount = () => {
            const checkedCount = grid.querySelectorAll(".gallery-select-cb:checked").length;
            const countEl = document.getElementById("delete-selected-count");
            if (countEl) countEl.textContent = checkedCount;
            
            const deleteBtn = document.getElementById("gallery-bulk-delete");
            if (deleteBtn) {
                deleteBtn.disabled = checkedCount === 0;
                deleteBtn.style.opacity = checkedCount === 0 ? "0.6" : "1";
            }
        };

        if (canEdit && folderItems.length > 0) {
            const toggleSelectBtn = header.querySelector("#gallery-toggle-select");
            const cancelSelectBtn = header.querySelector("#gallery-cancel-select");
            const deleteActions = header.querySelector("#gallery-delete-actions");
            const bulkDeleteBtn = header.querySelector("#gallery-bulk-delete");
            
            toggleSelectBtn.addEventListener("click", () => {
                document.body.classList.add("gallery-select-mode");
                toggleSelectBtn.style.display = "none";
                deleteActions.style.display = "flex";
                updateBulkDeleteCount();
            });
            
            cancelSelectBtn.addEventListener("click", () => {
                document.body.classList.remove("gallery-select-mode");
                toggleSelectBtn.style.display = "flex";
                deleteActions.style.display = "none";
                grid.querySelectorAll(".gallery-select-cb").forEach(cb => cb.checked = false);
                updateBulkDeleteCount();
            });
            
            bulkDeleteBtn.addEventListener("click", async () => {
                const checkedCbs = grid.querySelectorAll(".gallery-select-cb:checked");
                if (checkedCbs.length === 0) return;
                
                if (!confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพที่เลือกทั้งหมด ${checkedCbs.length} รูปออกจากระบบถาวร?\nข้อมูลรูปภาพที่ลบจะไม่สามารถกู้คืนได้!`)) {
                    return;
                }
                
                showToast(`กำลังลบรูปภาพ ${checkedCbs.length} รูปออกจากเซิร์ฟเวอร์...`, "info");
                
                const keysToDelete = [];
                checkedCbs.forEach(cb => {
                    const key = cb.getAttribute("data-img-key");
                    if (key) keysToDelete.push(key);
                });
                
                project.media = project.media.filter(item => !keysToDelete.includes(item.img));
                saveToLocalStorage();
                
                if (typeof supabaseClient !== "undefined") {
                    try {
                        const { error } = await supabaseClient.from('projects').delete().in('code', keysToDelete);
                        if (error) throw error;
                        showToast(`✅ ลบรูปภาพสำเร็จทั้งหมด ${checkedCbs.length} รูปเรียบร้อยแล้ว!`, "success");
                    } catch (err) {
                        console.error("Failed to delete batch images from Supabase:", err);
                        showToast(`ลบไฟล์บางส่วนล้มเหลว: ${err.message || err}`, "warning");
                    }
                } else {
                    showToast(`✅ ลบรูปภาพสำเร็จเฉพาะในเครื่อง ${checkedCbs.length} รูป`, "success");
                }
                
                document.body.classList.remove("gallery-select-mode");
                renderSubnavPhotosFiles(project);
            });
        }
        
        // 2. Render image cards
        folderItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "gallery-photo-card";
            card.style.position = "relative";
            card.innerHTML = `
                <div class="gallery-select-cb-wrapper">
                    <input type="checkbox" class="gallery-select-cb" data-img-key="${item.img}">
                </div>
                <img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 250 150'%2F%3E" alt="รูปภาพ" class="gallery-img" style="background:#f1f5f9; object-fit:cover; height: 160px; width: 100%; border-top-left-radius: inherit; border-top-right-radius: inherit;" onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=250&q=80'">
                <div class="photo-info" style="padding: 10px; display: flex; justify-content: center; align-items: center; background: #fff;">
                    <span class="date" style="font-size: 12px; color: var(--text-dark); font-weight: 500;">อัปเดต ${item.date}</span>
                </div>
            `;
            grid.appendChild(card);
            
            const cb = card.querySelector(".gallery-select-cb");
            if (cb) {
                cb.addEventListener("change", updateBulkDeleteCount);
            }
            
            const imgEl = card.querySelector(".gallery-img");
            if (item.img && item.img.startsWith("FILE:")) {
                supabaseClient.from('projects').select('data').eq('code', item.img).single()
                    .then(({ data, error }) => {
                        if (error) throw error;
                        if (data && data.data && data.data.fileUrl) {
                            imgEl.src = data.data.fileUrl;
                        }
                    })
                    .catch(err => {
                        console.error("Failed to load gallery image:", err);
                        imgEl.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=250&q=80';
                    });
            } else if (item.img) {
                imgEl.src = item.img;
            }
            



            // Add zoom preview / selection click listener to gallery image
            imgEl.style.cursor = "zoom-in";
            imgEl.addEventListener("click", () => {
                if (document.body.classList.contains("gallery-select-mode")) {
                    const cb = card.querySelector(".gallery-select-cb");
                    if (cb) {
                        cb.checked = !cb.checked;
                        updateBulkDeleteCount();
                    }
                } else {
                    // Collect all visible gallery image srcs
                    const allGalleryImgs = Array.from(document.querySelectorAll("#subtab-gallery-grid img")).map(im => im.src).filter(s => s && !s.includes("data:image/svg"));
                    const clickedIdx = allGalleryImgs.indexOf(imgEl.src);
                    window.openGalleryLightbox(allGalleryImgs, clickedIdx >= 0 ? clickedIdx : 0);
                }
            });
        });
    }
}


// ===== Gallery Lightbox with navigation =====
window._galleryLightboxOverlay = null;
window.openGalleryLightbox = function(imageSrcs, startIndex) {
    if (window._galleryLightboxOverlay) window._galleryLightboxOverlay.remove();
    let currentIdx = startIndex || 0;
    const total = imageSrcs.length;

    const overlay = document.createElement("div");
    overlay.id = "gallery-lightbox-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.88);display:flex;align-items:center;justify-content:center;z-index:12000;backdrop-filter:blur(4px);";
    window._galleryLightboxOverlay = overlay;

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = '\u2715';
    closeBtn.style.cssText = "position:absolute;top:18px;right:24px;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:22px;width:42px;height:42px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:12010;transition:background 0.2s;";
    closeBtn.onmouseenter = function(){ closeBtn.style.background = "rgba(255,255,255,0.3)"; };
    closeBtn.onmouseleave = function(){ closeBtn.style.background = "rgba(255,255,255,0.15)"; };
    closeBtn.onclick = function(e){ e.stopPropagation(); overlay.remove(); window._galleryLightboxOverlay = null; };
    overlay.appendChild(closeBtn);

    const counter = document.createElement("div");
    counter.style.cssText = "position:absolute;top:22px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.7);font-size:14px;font-family:Prompt,sans-serif;z-index:12010;";
    overlay.appendChild(counter);

    const imgContainer = document.createElement("div");
    imgContainer.style.cssText = "display:flex;align-items:center;justify-content:center;width:100%;height:100%;";
    overlay.appendChild(imgContainer);

    const largeImg = document.createElement("img");
    largeImg.style.cssText = "max-width:85vw;max-height:85vh;border-radius:8px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);transition:opacity 0.2s;user-select:none;pointer-events:none;";
    imgContainer.appendChild(largeImg);

    function makeArrow(icon, side) {
        const btn = document.createElement("button");
        btn.innerHTML = icon;
        btn.style.cssText = "position:absolute;top:50%;transform:translateY(-50%);" + side + ":16px;background:rgba(255,255,255,0.12);border:none;color:#fff;font-size:28px;width:48px;height:48px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:12010;transition:background 0.2s;";
        btn.onmouseenter = function(){ btn.style.background = "rgba(255,255,255,0.3)"; };
        btn.onmouseleave = function(){ btn.style.background = "rgba(255,255,255,0.12)"; };
        return btn;
    }

    const prevBtn = makeArrow("\u276E", "left");
    const nextBtn = makeArrow("\u276F", "right");
    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);

    function showImage(idx) {
        currentIdx = idx;
        largeImg.style.opacity = "0";
        setTimeout(function(){
            largeImg.src = imageSrcs[currentIdx];
            largeImg.style.opacity = "1";
        }, 100);
        counter.textContent = (currentIdx + 1) + " / " + total;
        prevBtn.style.display = currentIdx > 0 ? "flex" : "none";
        nextBtn.style.display = currentIdx < total - 1 ? "flex" : "none";
    }

    prevBtn.onclick = function(e){ e.stopPropagation(); if (currentIdx > 0) showImage(currentIdx - 1); };
    nextBtn.onclick = function(e){ e.stopPropagation(); if (currentIdx < total - 1) showImage(currentIdx + 1); };

    overlay.addEventListener("click", function(e){
        if (e.target === overlay || e.target === imgContainer) {
            overlay.remove();
            window._galleryLightboxOverlay = null;
        }
    });

    function onKey(e) {
        if (!document.body.contains(overlay)) { document.removeEventListener("keydown", onKey); return; }
        if (e.key === "ArrowLeft" && currentIdx > 0) { showImage(currentIdx - 1); e.preventDefault(); }
        else if (e.key === "ArrowRight" && currentIdx < total - 1) { showImage(currentIdx + 1); e.preventDefault(); }
        else if (e.key === "Escape") { overlay.remove(); window._galleryLightboxOverlay = null; document.removeEventListener("keydown", onKey); }
    }
    document.addEventListener("keydown", onKey);

    var touchStartX = 0;
    overlay.addEventListener("touchstart", function(e){ touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    overlay.addEventListener("touchend", function(e){
        var diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) {
            if (diff < 0 && currentIdx < total - 1) showImage(currentIdx + 1);
            else if (diff > 0 && currentIdx > 0) showImage(currentIdx - 1);
        }
    }, {passive: true});

    document.body.appendChild(overlay);
    showImage(currentIdx);
};
// ===== End Gallery Lightbox =====

function syncScurveMonthsWithGantt(project) {
    if (project.ganttData && project.ganttData.startDate && project.ganttData.endDate) {
        const dateList = [];
        const [sy, sm, sd] = project.ganttData.startDate.split('-').map(Number);
        const [ey, em, ed] = project.ganttData.endDate.split('-').map(Number);
        const start = new Date(sy, sm - 1, sd);
        const end = new Date(ey, em - 1, ed);

        let current = new Date(start);
        let count = 0;
        // Support up to 750 days (approx. 2 years) for S-Curve calculations
        while (current <= end && count < 750) {
            dateList.push(new Date(current));
            current.setDate(current.getDate() + 1);
            count++;
        }

        if (dateList.length > 0) {
            const viewMode = project.scurveViewMode || "weekly";
            let newLen = 0;
            const monthThaiNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
            
            if (viewMode === "daily") {
                newLen = dateList.length;
                const groups = [];
                dateList.forEach(d => {
                    const mIdx = d.getMonth();
                    const yTh = d.getFullYear() + 543;
                    const mName = monthThaiNames[mIdx] + " " + yTh;
                    let g = groups.find(x => x.name === mName);
                    if (!g) {
                        g = { name: mName, daysCount: 0, days: [] };
                        groups.push(g);
                    }
                    g.daysCount++;
                    g.days.push(d.getDate());
                });
                project.scurveDailyMonths = groups;
            } else {
                const ganttMonths = [];
                dateList.forEach(d => {
                    const mIdx = d.getMonth();
                    const yTh = d.getFullYear() + 543;
                    const mName = monthThaiNames[mIdx] + " " + yTh;
                    if (!ganttMonths.includes(mName)) {
                        ganttMonths.push(mName);
                    }
                });
                if (ganttMonths.length > 0) {
                    project.scurveMonths = ganttMonths;
                }
                newLen = project.scurveMonths.length * 4;
            }

            if (newLen > 0) {
                if (project.scurveData && project.scurveData.length > 0) {
                    project.scurveData.forEach(item => {
                        if (viewMode === "daily") {
                            if (!item.planDays) item.planDays = [];
                            if (!item.actualDays) item.actualDays = [];
                            while (item.planDays.length < newLen) item.planDays.push(0);
                            while (item.actualDays.length < newLen) item.actualDays.push(0);
                            if (item.planDays.length > newLen) item.planDays = item.planDays.slice(0, newLen);
                            if (item.actualDays.length > newLen) item.actualDays = item.actualDays.slice(0, newLen);
                        } else {
                            if (!item.plan) item.plan = [];
                            if (!item.actual) item.actual = [];
                            while (item.plan.length < newLen) item.plan.push(0);
                            while (item.actual.length < newLen) item.actual.push(0);
                            if (item.plan.length > newLen) item.plan = item.plan.slice(0, newLen);
                            if (item.actual.length > newLen) item.actual = item.actual.slice(0, newLen);
                        }
                    });
                }
                if (viewMode === "daily") {
                    if (!project.scurvePlanCumDays) project.scurvePlanCumDays = [];
                    while (project.scurvePlanCumDays.length < newLen) project.scurvePlanCumDays.push(0);
                    if (project.scurvePlanCumDays.length > newLen) project.scurvePlanCumDays = project.scurvePlanCumDays.slice(0, newLen);
                } else {
                    if (!project.scurvePlanCum) project.scurvePlanCum = [];
                    while (project.scurvePlanCum.length < newLen) project.scurvePlanCum.push(0);
                    if (project.scurvePlanCum.length > newLen) project.scurvePlanCum = project.scurvePlanCum.slice(0, newLen);
                }
            }
        }
    }
}


function initScurveAutocomplete(project, textarea) {
    if (!project || !project.ganttData || !project.ganttData.tasks) return;
    
    // ดึงรายชื่องานจาก Gantt Chart โดยตัดช่องว่างหัวท้ายและตัดค่าว่างออก
    const suggestions = Array.from(new Set(
        project.ganttData.tasks
            .map(t => t.name ? t.name.trim() : "")
            .filter(name => name.length > 0)
    ));
    
    if (suggestions.length === 0) return;
    
    // สร้างหรือหา dropdown สำหรับ autocomplete
    let dropdown = document.getElementById("scurve-autocomplete-dropdown");
    if (!dropdown) {
        dropdown = document.createElement("div");
        dropdown.id = "scurve-autocomplete-dropdown";
        dropdown.style.cssText = "position: absolute; background: #fff; border: 1.5px solid var(--border-color); border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); max-height: 180px; overflow-y: auto; z-index: 99999; display: none; font-family: 'Prompt', sans-serif; min-width: 250px;";
        document.body.appendChild(dropdown);
        
        // ปิดดรอปดาวน์เมื่อเลื่อนหน้าจอหรือเลื่อนตาราง (แก้ปัญหากล่องลอยค้างเวลาเลื่อน)
        window.addEventListener("scroll", () => {
            dropdown.style.display = "none";
        }, { capture: true, passive: true });
    }
    
    const showDropdown = () => {
        const val = textarea.value.trim().toLowerCase();
        if (!val) {
            dropdown.style.display = "none";
            return;
        }
        
        // ค้นหารายการที่คำพิมพ์ตรงกัน
        const matches = suggestions.filter(s => s.toLowerCase().includes(val));
        if (matches.length === 0) {
            dropdown.style.display = "none";
            return;
        }
        
        // จัดตำแหน่ง dropdown ให้อยู่ใต้ textarea พอดี
        const rect = textarea.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.style.width = `${rect.width}px`;
        
        dropdown.innerHTML = "";
        matches.forEach(match => {
            const item = document.createElement("div");
            item.style.cssText = "padding: 8px 12px; cursor: pointer; font-size: 12.5px; border-bottom: 1px solid var(--border-color); color: #334155; font-weight: 500; transition: background 0.15s; text-align: left;";
            
            // Highlight ส่วนที่ตรงกัน
            const escapedVal = val.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            item.innerHTML = match.replace(new RegExp(`(${escapedVal})`, 'gi'), '<strong style="color:#2563eb;">$1</strong>');
            
            item.addEventListener("mouseenter", () => {
                item.style.background = "#eff6ff";
            });
            item.addEventListener("mouseleave", () => {
                item.style.background = "none";
            });
            item.addEventListener("mousedown", (e) => {
                e.preventDefault(); // กันไม่ให้บลาร์ออกจาก textarea
                textarea.value = match;
                textarea.dispatchEvent(new Event("input", { bubbles: true }));
                
                // ปรับความสูง textarea อัตโนมัติ
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
                dropdown.style.display = "none";
            });
            dropdown.appendChild(item);
        });
        dropdown.style.display = "block";
    };
    
    textarea.addEventListener("input", showDropdown);
    textarea.addEventListener("focus", showDropdown);
    textarea.addEventListener("blur", () => {
        // ดีเลย์นิดนึงเพื่อให้เหตุการณ์ mousedown ในรายการทำงานได้ก่อนซ่อน
        setTimeout(() => {
            dropdown.style.display = "none";
        }, 180);
    });
}

function renderSubnavActualProgress(project) {
    syncScurveMonthsWithGantt(project);
    if (!project.scurveMonths || project.scurveMonths.length === 0) project.scurveMonths = ["Month 1"];
    if (!project.scurveData) project.scurveData = [];

    // Calculate plan S-curve from Gantt chart daily cells
    calculatePlanScurveFromGantt(project);

    // Calculate budget weights
    let totalBudget = 0;
    project.scurveData.forEach(item => {
        if (!item.isSubtask) {
            totalBudget += parseFloat(item.budget) || 0;
        }
    });
    project.scurveData.forEach(item => {
        if (!item.isSubtask) {
            item.weight = totalBudget > 0 ? (item.budget / totalBudget) * 100 : 0;
        } else {
            item.weight = 0;
        }
    });

    const head = document.getElementById("scurve-table-head");
    const body = document.getElementById("scurve-table-body");
    if (!head || !body) return;

    const canEdit = (appState.currentRole === "pm" || appState.currentRole === "admin" || appState.currentRole === "pe") && appState.selectedDetailProject !== "all";

    // Build Headers
    const hideBudget = (appState.currentRole === "pe" || appState.currentRole === "customer" || appState.currentRole === "technician" || appState.currentRole === "tech");
    const hideWeight = (appState.currentRole === "customer");
    let headerRow1 = `<tr style="background: #e0e7ff; border-bottom: 1px solid var(--border-color); text-align: center; font-size: 13.5px; font-weight: 700;">
        <th rowspan="2" style="padding: 10px; width: 55px; border: 1px solid var(--border-color);">Items</th>
        <th rowspan="2" style="padding: 10px; text-align: left; min-width: 350px; border: 1px solid var(--border-color);">Description</th>
        ${hideBudget ? '' : '<th rowspan="2" style="padding: 10px; width: 90px; border: 1px solid var(--border-color);">Budget</th>'}
        ${hideWeight ? '' : '<th rowspan="2" style="padding: 10px; width: 65px; border: 1px solid var(--border-color);">%</th>'}
        <th rowspan="2" style="padding: 10px; width: 65px; border: 1px solid var(--border-color);">% (รวม)</th>`;
    let headerRow2 = `<tr style="background: #f1f5f9; border-bottom: 2px solid var(--border-color); text-align: center;">`;
 
    project.scurveMonths.forEach((month, mIdx) => {
        headerRow1 += `<th colspan="4" style="padding: 8px; border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); font-size: 13.5px; font-weight: 700;">
            ${canEdit ? `<input type="text" class="scurve-month-name" data-idx="${mIdx}" value="${month}" style="width: 100px; font-size: 12.5px; font-weight: 700; text-align: center; border: 1px solid #ccc; border-radius: 4px; padding: 2px 4px;">` : month}
        </th>`;
        for (let w = 1; w <= 4; w++) {
            headerRow2 += `<th style="padding: 6px; width: 45px; font-weight: 600; font-size: 11.5px; border-left: ${w===1 ? '1px' : '0'} solid var(--border-color); border-bottom: 1px solid var(--border-color);">${w}</th>`;
        }
    });
    headerRow1 += `<th rowspan="2" class="hide-accounting hide-customer" style="padding: 10px; width: 40px; border: 1px solid var(--border-color);">ลบ</th></tr>`;
    headerRow2 += `</tr>`;
    head.innerHTML = headerRow1 + headerRow2;
 
    // Build Body
    body.innerHTML = "";
    if (project.scurveData.length === 0) {
        body.innerHTML = `<tr><td colspan="${(hideBudget ? 5 : 6) + project.scurveMonths.length * 4}" style="text-align: center; color: var(--text-muted); padding: 24px;">ยังไม่มีรายการงาน</td></tr>`;
    } else {
        project.scurveData.forEach((item, idx) => {
            if (!item.plan) item.plan = new Array(project.scurveMonths.length * 4).fill(0);
            if (!item.actual) item.actual = new Array(project.scurveMonths.length * 4).fill(0);
            
            while(item.plan.length < project.scurveMonths.length * 4) item.plan.push(0);
            while(item.actual.length < project.scurveMonths.length * 4) item.actual.push(0);
 
            // Calculate sum for both plan and actual progress
            let currentTotal = 0;
            const isPlanMode = currentScurveMode === 'plan';
            const vals = isPlanMode ? item.plan : item.actual;
            vals.forEach(v => currentTotal += (parseFloat(v) || 0));
            item.totalPercent = parseFloat(currentTotal.toFixed(1));
 
            const isSub = item.isSubtask;
            const row = document.createElement("tr");
            row.style = "border-bottom: 1px solid var(--border-color);";
            row.setAttribute("data-row-idx", idx);
            
            const readonlyAttr = canEdit ? '' : 'readonly';
            const inputStyle = `style="width: 100%; font-size: 12.5px; text-align: center; padding: 5px 2px; border: 1px solid transparent; background: transparent; color: #334155;"`;
            const editInputStyle = `style="width: 100%; font-size: 12.5px; text-align: center; padding: 5px 2px; border: 1px solid var(--border-color); border-radius: 4px; background: #fff; color: #334155;"`;
 
            let rowHtml = `
                <td style="padding: 6px; text-align: center;">
                    ${isSub ? '' : `<input type="text" class="scurve-item-num" data-idx="${idx}" value="${item.item || ''}" ${readonlyAttr} ${canEdit?editInputStyle:inputStyle} style="font-weight: 600;">`}
                </td>
                <td style="padding: 6px 10px; min-width: 350px;">
                    <div style="display: flex; gap: 4px; padding-left: ${isSub ? '16px' : '0'};">
                        ${isSub ? '<span style="color:#64748b; font-weight: 600;">-</span>' : ''}
                        <textarea class="scurve-item-name" data-idx="${idx}" placeholder="${isSub?'ชื่องานย่อย':'ชื่องานหลัก'}" ${readonlyAttr} style="width: 100%; font-size: 12.5px; padding: 5px 8px; border: 1px solid ${canEdit?'var(--border-color)':'transparent'}; border-radius: 4px; background: ${canEdit?'#fff':'transparent'}; font-weight: ${isSub?'normal':'700'}; color: #334155; resize: none; overflow: hidden; height: auto;" rows="1" oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px';" onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">${item.name || ''}</textarea>
                    </div>
                </td>
                ${hideBudget ? '' : `
                <td style="padding: 6px;">
                    ${isSub ? '' : `<input type="text" class="scurve-budget" data-idx="${idx}" value="${formatNumber(item.budget || 0)}" ${readonlyAttr} ${canEdit?editInputStyle:inputStyle} oninput="formatBudgetInput(this)">`}
                </td>
                `}
                ${hideWeight ? '' : `
                <td style="padding: 6px;">
                    ${isSub ? '' : `<input type="number" class="scurve-weight" data-idx="${idx}" value="${(item.weight || 0).toFixed(2)}" readonly style="width: 100%; font-size: 10.5px; text-align: center; padding: 3px 2px; border: 1px solid transparent; background: #f8fafc; font-weight: bold; color: var(--navy-dark);">`}
                </td>
                `}
                <td style="padding: 6px;">
                    ${isSub ? '' : `<input type="number" class="scurve-total-pct" data-idx="${idx}" value="${item.totalPercent}" readonly style="width: 100%; font-size: 12.5px; text-align: center; padding: 5px 2px; border: 1px solid transparent; background: #f8fafc; font-weight: bold; color: ${item.totalPercent === 100 ? '#10b981' : '#e63946'};">`}
                </td>
            `;

            const isEditableCell = canEdit && !isPlanMode;
            const cellReadonlyAttr = isEditableCell ? '' : 'readonly';

            for (let m = 0; m < project.scurveMonths.length; m++) {
                for (let w = 0; w < 4; w++) {
                    let wIdx = (m * 4) + w;
                    let val = isPlanMode ? item.plan[wIdx] : item.actual[wIdx];
                    let valStr = val === 0 ? '' : (isPlanMode ? val.toFixed(1) : val);
                    rowHtml += `<td style="padding: 6px; border-left: ${w===0 ? '1px' : '0'} solid var(--border-color); border-right: ${w===3 ? '1px' : '0'} solid var(--border-color);">
                        <input type="number" class="scurve-cell-val" data-idx="${idx}" data-widx="${wIdx}" value="${valStr}" min="0" max="100" step="0.1" ${cellReadonlyAttr} ${isEditableCell ? editInputStyle : inputStyle} placeholder="">
                    </td>`;
                }
            }

            rowHtml += `
                <td class="hide-accounting hide-customer" style="padding: 4px; text-align: center;">
                    ${canEdit ? `<button type="button" onclick="deleteScurveRow(${idx})" title="ลบรายการ" style="background:none; border:none; color:#e63946; cursor:pointer; font-size:13px;"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                </td>
            `;
            
            row.innerHTML = rowHtml;
            body.appendChild(row);
        });

        // Add real-time event listener to update % (รวม) when weekly cell changes and sync to object
        if (canEdit) {
            body.removeEventListener("input", window._scurveInputHandler); // clean up previous
            window._scurveInputHandler = function(e) {
                // If it's an S-Curve input, sync the DOM to the object immediately
                if (e.target.classList.contains("scurve-cell-val") || 
                    e.target.classList.contains("scurve-item-num") || 
                    e.target.classList.contains("scurve-item-name") || 
                    e.target.classList.contains("scurve-budget") || 
                    e.target.classList.contains("scurve-weight") || 
                    e.target.classList.contains("scurve-plan-cum-val") || 
                    e.target.classList.contains("scurve-month-name")) {
                    
                    syncScurveDOMToObject(project);

                    // If it was a weekly cell value, update the visual row total
                    if (e.target.classList.contains("scurve-cell-val")) {
                        const rowIdx = e.target.getAttribute("data-idx");
                        const rowTr = document.querySelector(`tr[data-row-idx="${rowIdx}"]`);
                        if (rowTr) {
                            let totalVal = 0;
                            if (currentScurveMode === 'plan') {
                                rowTr.querySelectorAll(".scurve-cell-val").forEach(inp => {
                                    totalVal += parseFloat(inp.value) || 0;
                                });
                            } else {
                                rowTr.querySelectorAll(".scurve-cell-val").forEach(inp => {
                                    totalVal += parseFloat(inp.value) || 0;
                                });
                                totalVal = parseFloat(totalVal.toFixed(1));
                            }
                            const totalEl = rowTr.querySelector(".scurve-total-pct");
                            if (totalEl) {
                                totalEl.value = totalVal;
                                totalEl.style.color = totalVal === 100 ? '#10b981' : '#e63946';
                            }
                        }
                    }
                }
            };
            body.addEventListener("input", window._scurveInputHandler);
        }
    }

    updateScurveTotals(project);
    renderSCurveChart(project);

    // Auto-resize S-Curve task textareas to fit content on load
    body.querySelectorAll(".scurve-item-name").forEach(tx => {
        tx.style.height = 'auto';
        tx.style.height = tx.scrollHeight + 'px';
        if (canEdit) {
            initScurveAutocomplete(project, tx);
        }
    });
}

function renderSubnavProjectBarChart(wb) {
    const canvas = document.getElementById('detailProjectBarChart');
    if (!canvas) return;
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }
    try {
        const ctx = canvas.getContext('2d');
        
        if (detailProjectBarChart) {
            detailProjectBarChart.destroy();
        }
        
        const categories = ["งานไฟฟ้า", "งานปรับอากาศ", "งานระบบน้ำ", "งานโครงสร้าง", "งานสถาปัตย์", "งานอื่น ๆ"];
        const inprogress = wb.inprogress || [0, 0, 0, 0, 0, 0];
        const completed = wb.completed || [0, 0, 0, 0, 0, 0];
        const delayed = wb.delayed || [0, 0, 0, 0, 0, 0];
        
        const total = categories.map((_, i) => {
            return (inprogress[i] || 0) + (completed[i] || 0) + (delayed[i] || 0);
        });
        
        detailProjectBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [
                    {
                        label: 'งานที่กำลังดำเนินการ',
                        data: inprogress,
                        backgroundColor: '#059669', // Green (matches KPI card)
                        borderRadius: 2
                    },
                    {
                        label: 'งานเสร็จแล้วรอส่งงาน/อนุมัติ',
                        data: completed,
                        backgroundColor: '#0284c7', // Teal (matches KPI card)
                        borderRadius: 2
                    },
                    {
                        label: 'งานอนุมัติ',
                        data: delayed,
                        backgroundColor: '#f59e0b', // Amber/Orange (matches KPI card)
                        borderRadius: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { font: { size: 9, family: 'Prompt' } }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 9, family: 'Prompt' } }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { font: { size: 9, family: 'Prompt' }, precision: 0 }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error drawing project bar chart:", err);
    }
}

function renderSubnavProjectDonutChart(inprogress, completed, delayed) {
    const canvas = document.getElementById('detailProjectDonutChart');
    if (!canvas) return;
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }
    try {
        const ctx = canvas.getContext('2d');
        
        if (detailProjectDonutChart) {
            detailProjectDonutChart.destroy();
        }
        
        const total = inprogress + completed + delayed;
        const ipPercent = total > 0 ? Math.round((inprogress / total) * 100) : 0;
        const compPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
        const delayPercent = total > 0 ? 100 - ipPercent - compPercent : 0;
        
        detailProjectDonutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    `งานที่กำลังดำเนินการ ${ipPercent}%`, 
                    `งานเสร็จแล้วรอส่งงาน/อนุมัติ ${compPercent}%`, 
                    `งานอนุมัติ ${delayPercent}%`
                ],
                datasets: [{
                    data: [inprogress, completed, delayed],
                    backgroundColor: ['#059669', '#0284c7', '#f59e0b'],
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
                        position: 'bottom',
                        labels: {
                            boxWidth: 10,
                            font: { size: 9, family: 'Prompt' }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error drawing project donut chart:", err);
    }
}

function renderSubnavYearlyComparisonChart(customerName) {
    const canvas = document.getElementById('projectYearlyComparisonChart');
    if (!canvas) return;
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }
    try {
        const ctx = canvas.getContext('2d');
        if (projectYearlyComparisonChart) {
            projectYearlyComparisonChart.destroy();
        }
        
        // Always group by year (average planned & actual across all projects of the same hospital/year)
        const source = (customerName === "ทั้งหมดทุกโรงพยาบาล" || customerName === "all")
            ? Object.values(projectsData)
            : Object.values(projectsData).filter(p => p.customer === customerName);

        const yearsMap = {};
        source.forEach(p => {
            if (!yearsMap[p.year]) {
                yearsMap[p.year] = { year: p.year, progressSum: 0, plannedSum: 0, count: 0 };
            }
            yearsMap[p.year].progressSum += p.progress;
            yearsMap[p.year].plannedSum += p.plannedProgress;
            yearsMap[p.year].count++;
        });
        const list = Object.values(yearsMap).map(item => ({
            year: item.year,
            progress: Math.round(item.progressSum / item.count),
            plannedProgress: Math.round(item.plannedSum / item.count)
        })).sort((a, b) => a.year - b.year);
            
        const years = list.map(p => `ปี ${p.year}`);
        const plannedProgresses = list.map(p => p.plannedProgress);
        const actualProgresses = list.map(p => p.progress);
        
        projectYearlyComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'แผนงาน (Planned %)',
                        data: plannedProgresses,
                        backgroundColor: '#1d3557', // Deep navy
                        borderRadius: 4
                    },
                    {
                        label: 'งานจริง (Actual %)',
                        data: actualProgresses,
                        backgroundColor: '#10b981', // Emerald green
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { family: 'Prompt', size: 10 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label.split(' ')[0] + ': ' + context.raw + '%';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Prompt', size: 10 } }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            font: { family: 'Prompt', size: 9 },
                            callback: function(value) { return value + '%'; }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error drawing project yearly comparison chart:", err);
    }
}

function renderSubnavCostTab(project) {
    if (!document.getElementById("subtab-cost-v-value")) return;
    // Value labels
    document.getElementById("subtab-cost-v-value").textContent = formatNumber(project.value);
    document.getElementById("subtab-cost-v-cost").textContent = formatNumber(project.cost);
    document.getElementById("subtab-cost-v-profit").textContent = formatNumber(project.profit);
    
    // Cost Structure Donut
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }
    try {
        const ctx = document.getElementById('subtabCostStructureDonut').getContext('2d');
        if (subtabCostStructureDonut) {
            subtabCostStructureDonut.destroy();
        }
        
        // Calculate actual amounts from expenses
        let laborAmt = 0, materialAmt = 0, otherAmt = 0;
        if (project.expenses && project.expenses.length > 0) {
            project.expenses.forEach(e => {
                if (e.status === "รออนุมัติ" || e.status === "ปฏิเสธ") return;
                if (e.type === "ค่าแรง") laborAmt += e.amount;
                else if (e.type === "ค่าวัสดุ") materialAmt += e.amount;
                else otherAmt += e.amount;
            });
        }
        const spentTotal = laborAmt + materialAmt + otherAmt;
        const projectValue = project.value || 0;
        const remaining = Math.max(0, projectValue - spentTotal);
        const isEmpty = spentTotal === 0;
        
        // Build chart data: actual amounts for each category + remaining as gray
        let chartData, chartLabels, chartColors;
        if (isEmpty) {
            chartData = [1];
            chartLabels = ["ยังไม่มีบันทึกต้นทุน"];
            chartColors = ['#f1f5f9'];
        } else {
            chartData = [];
            chartLabels = [];
            chartColors = [];
            if (laborAmt > 0) {
                chartData.push(laborAmt);
                chartLabels.push(`ค่าแรง ${formatNumber(laborAmt)} บาท`);
                chartColors.push('#1d3557');
            }
            if (materialAmt > 0) {
                chartData.push(materialAmt);
                chartLabels.push(`ค่าวัสดุ ${formatNumber(materialAmt)} บาท`);
                chartColors.push('#457b9d');
            }
            if (otherAmt > 0) {
                chartData.push(otherAmt);
                chartLabels.push(`อื่นๆ ${formatNumber(otherAmt)} บาท`);
                chartColors.push('#e63946');
            }
            if (remaining > 0) {
                chartData.push(remaining);
                chartLabels.push(`คงเหลือ ${formatNumber(remaining)} บาท`);
                chartColors.push('#e2e8f0');
            }
        }
        
        subtabCostStructureDonut = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: chartColors,
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            boxWidth: 10, 
                            font: { size: 9, family: 'Prompt' },
                            color: '#334155'
                        }
                    },
                    tooltip: {
                        enabled: !isEmpty,
                        callbacks: {
                            label: function(context) {
                                const val = context.raw;
                                const pct = projectValue > 0 ? ((val / projectValue) * 100).toFixed(1) : 0;
                                return ` ${context.label} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error drawing subtab cost structure donut:", err);
    }
    
    // Expenses List
    const tableBody = document.getElementById("subtab-expenses-table-body");
    if (tableBody) {
        tableBody.innerHTML = "";
        const isPM = (appState.currentRole === "pm" || appState.currentRole === "admin");
        const colCount = isPM ? 6 : 5;
        if (!project.expenses || project.expenses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${colCount}" class="text-center text-muted py-4">ไม่มีข้อมูลธุรกรรมรายจ่าย</td></tr>`;
            return;
        }
        project.expenses.forEach((e, idx) => {
            const tr = document.createElement("tr");
            
            const status = e.status || "จ่ายตรง";
            let badgeClass = "info";
            let statusText = "จ่ายตรง";
            if (status === "รออนุมัติ") {
                badgeClass = "warning";
                statusText = "รออนุมัติ";
            } else if (status === "อนุมัติแล้ว") {
                badgeClass = "success";
                statusText = "อนุมัติแล้ว";
            } else if (status === "ปฏิเสธ") {
                badgeClass = "danger";
                statusText = `ปฏิเสธ ${e.rejectReason ? '(' + e.rejectReason + ')' : ''}`;
            }

            const statusHTML = `<span class="badge-status ${badgeClass}" title="${statusText}">${statusText}</span>`;

            const actionsHTML = `
                <td class="text-center hide-accounting">
                    <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                        <button class="btn btn-xs btn-outline-blue btn-edit-expense" 
                            data-idx="${idx}"
                            style="font-size: 10.5px; padding: 3px 8px; display: flex; align-items: center; gap: 4px; background: none; border: 1px solid #1d4ed8; color: #1d4ed8; border-radius: 4px; cursor: pointer;">
                            <i class="fa-solid fa-pen"></i> แก้ไข
                        </button>
                        <button class="btn btn-xs btn-outline-red btn-delete-expense" 
                            data-idx="${idx}"
                            style="font-size: 10.5px; padding: 3px 8px; display: flex; align-items: center; gap: 4px; background: none; border: 1px solid #ef4444; color: #ef4444; border-radius: 4px; cursor: pointer;">
                            <i class="fa-solid fa-trash-can"></i> ลบ
                        </button>
                    </div>
                </td>
            `;

            tr.innerHTML = `
                <td>${e.date}</td>
                <td><strong>${e.title}</strong></td>
                <td><span class="badge-status ${e.type === "ค่าแรง" ? "success" : "warning"}">${e.type}</span></td>
                <td>${statusHTML}</td>
                <td class="text-right text-navy font-semibold">${formatNumber(e.amount)} บาท</td>
                ${actionsHTML}
            `;
            tableBody.appendChild(tr);
        });

        // Add event listeners to the edit and delete buttons
        tableBody.querySelectorAll(".btn-edit-expense").forEach(btn => {
            btn.addEventListener("click", function() {
                const expenseIdx = parseInt(this.getAttribute("data-idx"));
                updateSelectedCostProject(project.code);
                if (window.openExpenseModal) window.openExpenseModal(expenseIdx);
            });
        });

        tableBody.querySelectorAll(".btn-delete-expense").forEach(btn => {
            btn.addEventListener("click", function() {
                const expenseIdx = parseInt(this.getAttribute("data-idx"));
                updateSelectedCostProject(project.code);
                deleteExpense(expenseIdx);
            });
        });
    }
}

function renderSubnavDocumentsTab(project) {
    const isRestrictedRole = (appState.currentRole === "customer" || appState.currentRole === "technician" || appState.currentRole === "tech" || appState.currentRole === "pe");
    
    // Toggle filter buttons visibility based on role
    const contractBtn = document.querySelector("#subtab-doc-tab-filters .doc-filter-btn[data-filter='Contract']");
    const poBtn = document.querySelector("#subtab-doc-tab-filters .doc-filter-btn[data-filter='PO']");
    if (contractBtn) contractBtn.style.display = isRestrictedRole ? "none" : "";
    if (poBtn) poBtn.style.display = isRestrictedRole ? "none" : "";
    
    // If the active filter is hidden, reset it to 'all'
    let activeBtn = document.querySelector("#subtab-doc-tab-filters .doc-filter-btn.active");
    if (isRestrictedRole && activeBtn && (activeBtn.getAttribute("data-filter") === "Contract" || activeBtn.getAttribute("data-filter") === "PO")) {
        document.querySelectorAll("#subtab-doc-tab-filters .doc-filter-btn").forEach(btn => {
            if (btn.getAttribute("data-filter") === "all") {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }

    const filter = document.querySelector("#subtab-doc-tab-filters .doc-filter-btn.active")?.getAttribute("data-filter") || "all";
    const tableBody = document.getElementById("subtab-documents-table-body");
    if (!tableBody) return;
    
    tableBody.innerHTML = "";
    
    let docs = project.documents || [];
    if (isRestrictedRole) {
        docs = docs.filter(d => d.type === "BOQ" || d.type === "Drawings");
    }
    
    const filteredDocs = filter === "all" ? docs : docs.filter(d => d.type === filter);
    
    if (filteredDocs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">ไม่พบเอกสารประเภทที่เลือก</td></tr>`;
        return;
    }
    
    filteredDocs.forEach((d, idx) => {
        const tr = document.createElement("tr");
        
        const canDelete = (appState.currentRole === "pm" || appState.currentRole === "admin" || appState.currentRole === "pe");
        const deleteButtonHTML = canDelete 
            ? `<button class="btn-delete-row" data-idx="${idx}" title="ลบเอกสาร" style="background:none; border:none; color:#e63946; cursor:pointer; padding: 4px; font-size:14px;"><i class="fa-solid fa-trash-can"></i></button>`
            : `<button class="btn-delete-row" disabled style="opacity:0.3; cursor:not-allowed;" title="ไม่มีสิทธิ์ลบข้อมูล" style="background:none; border:none; color:#cbd5e1; cursor:not-allowed; padding: 4px; font-size:14px;"><i class="fa-solid fa-trash-can"></i></button>`;
        
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <i class="fa-solid fa-file-pdf text-red mr-2 fs-5" style="color: #ef4444; margin-right: 8px; font-size: 16px;"></i>
                    <strong>${d.name}</strong>
                </div>
            </td>
            <td><span class="badge-status font-sm" style="font-size: 11px; padding: 2px 6px; background-color: #f1f5f9; color: #475569; border-radius: 4px; font-weight: 600;">${d.type}</span></td>
            <td>${d.uploadedAt || d.date}</td>
            <td class="text-right">
                ${d.fileUrl ? `
                <button class="btn btn-sm btn-outline btn-download-file" data-url="${d.fileUrl}" data-file="${d.name}" style="font-size: 10px; padding: 4px 8px; height: auto; display: inline-flex; align-items: center; gap: 4px; margin-right: 4px; background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); cursor: pointer;">
                    <i class="fa-solid fa-download"></i> ดาวน์โหลด
                </button>
                ${d.name.toLowerCase().endsWith('.pdf') ? `
                <button class="btn btn-sm btn-outline btn-view-doc-pdf" data-url="${d.fileUrl}" data-file="${d.name}" style="font-size: 10px; padding: 4px 8px; height: auto; display: inline-flex; align-items: center; gap: 4px; margin-right: 4px; background: rgba(15, 82, 186, 0.1); color: var(--primary-blue); border-color: rgba(15, 82, 186, 0.2); cursor: pointer;">
                    <i class="fa-solid fa-eye"></i> ดู PDF
                </button>
                ` : ''}
                ` : `
                <a href="#" class="btn btn-sm btn-outline download-link" data-name="${d.name}" style="font-size: 10px; padding: 4px 8px; height: auto; display: inline-flex; align-items: center; gap: 4px; margin-right: 4px; background: rgba(0,0,0,0.05); color: #64748b; text-decoration: none; border-color: rgba(0,0,0,0.1);">
                    <i class="fa-solid fa-download"></i> ไม่มีไฟล์อ้างอิง
                </a>
                `}
                ${deleteButtonHTML}
            </td>
        `;
        tableBody.appendChild(tr);
    });

    // Hook Delete document handler
    tableBody.querySelectorAll(".btn-delete-row").forEach(btn => {
        btn.addEventListener("click", function() {
            const docIdx = parseInt(this.getAttribute("data-idx"));
            deleteDocument(docIdx);
        });
    });

    // Hook Download handler (fallback for items without fileUrl)
    tableBody.querySelectorAll(".download-link").forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const fileName = this.getAttribute("data-name");
            showToast(`เริ่มดาวน์โหลดเอกสาร: ${fileName} (กำลังจำลองดาวน์โหลด)`, "info");
        });
    });

    // Hook Actual Download handler
    tableBody.querySelectorAll(".btn-download-file").forEach(btn => {
        btn.addEventListener("click", function() {
            const fileUrl = this.getAttribute("data-url");
            const fileName = this.getAttribute("data-file");
            if (window.downloadFileFromSupabase) {
                window.downloadFileFromSupabase(fileUrl, fileName);
            }
        });
    });

    // Hook View PDF handler
    tableBody.querySelectorAll(".btn-view-doc-pdf").forEach(btn => {
        btn.addEventListener("click", function() {
            const fileUrl = this.getAttribute("data-url");
            const fileName = this.getAttribute("data-file");
            if (window.openPdfViewer) {
                window.openPdfViewer(fileUrl, fileName, fileName);
            }
        });
    });
}



let currentScurveMode = 'actual'; // Global state for S-Curve mode
let currentGanttBrush = 'red'; // Global state for Gantt brush
let isGanttPainting = false;
let ganttSelectedRowIdx = -1; // Track selected row for insert-between feature

// Format date to YYYY-MM-DD in local timezone safely
function formatDateLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function renderSubnavPlanWork(project) {
    if (!document.getElementById("gantt-grid-head")) return;
    // 1. Initialize project.ganttData if not exists
    if (!project.ganttData) {
        project.ganttData = {
            header: {
                date: new Date().toLocaleDateString('th-TH'),
                subject: "แผนการดำเนินงาน " + (project.name || ""),
                to: "",
                refPo: project.code || ""
            },
            startDate: project.startDate || formatDateLocal(new Date()),
            endDate: project.endDate || formatDateLocal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            tasks: []
        };
    }

    // Set setup inputs value
    const startDateInput = document.getElementById("gantt-start-date");
    const endDateInput = document.getElementById("gantt-end-date");
    const docDateInput = document.getElementById("gantt-doc-date");
    const docSubjectInput = document.getElementById("gantt-doc-subject");
    const docToInput = document.getElementById("gantt-doc-to");
    const docRefInput = document.getElementById("gantt-doc-ref");

    const canEdit = (appState.currentRole === "pm" || appState.currentRole === "admin" || appState.currentRole === "pe") && appState.selectedDetailProject !== "all";

    if (startDateInput) {
        startDateInput.value = project.ganttData.startDate;
        startDateInput.disabled = !canEdit;
    }
    if (endDateInput) {
        endDateInput.value = project.ganttData.endDate;
        endDateInput.disabled = !canEdit;
    }
    if (docDateInput) {
        docDateInput.value = project.ganttData.header.date || "";
        docDateInput.disabled = !canEdit;
        docDateInput.oninput = function() { project.ganttData.header.date = this.value.trim(); window.ganttIsDirty = true; };
    }
    if (docSubjectInput) {
        docSubjectInput.value = project.ganttData.header.subject || "";
        docSubjectInput.disabled = !canEdit;
        docSubjectInput.oninput = function() { project.ganttData.header.subject = this.value.trim(); window.ganttIsDirty = true; };
    }
    if (docToInput) {
        docToInput.value = project.ganttData.header.to || "";
        docToInput.disabled = !canEdit;
        docToInput.oninput = function() { project.ganttData.header.to = this.value.trim(); window.ganttIsDirty = true; };
    }
    if (docRefInput) {
        docRefInput.value = project.ganttData.header.refPo || "";
        docRefInput.disabled = !canEdit;
        docRefInput.oninput = function() { project.ganttData.header.refPo = this.value.trim(); window.ganttIsDirty = true; };
    }

    // Bind and set View Mode
    const viewModeSelect = document.getElementById("gantt-view-mode");
    if (viewModeSelect) {
        viewModeSelect.value = project.ganttData.viewMode || "daily";
        viewModeSelect.onchange = function() {
            project.ganttData.viewMode = this.value;
            if (canEdit) {
                window.ganttIsDirty = true;
            }
            renderSubnavPlanWork(project);
        };
    }

    // Calculate dates array based on viewMode
    const dateList = [];
    if (project.ganttData.startDate && project.ganttData.endDate) {
        const [sy, sm, sd] = project.ganttData.startDate.split('-').map(Number);
        const [ey, em, ed] = project.ganttData.endDate.split('-').map(Number);
        const start = new Date(sy, sm - 1, sd);
        const end = new Date(ey, em - 1, ed);

        const viewMode = project.ganttData.viewMode || "daily";

        if (viewMode === "daily") {
            let current = new Date(start);
            let count = 0;
            // Limit daily view to 150 days max
            while (current <= end && count < 150) {
                dateList.push(new Date(current));
                current.setDate(current.getDate() + 1);
                count++;
            }
        } else if (viewMode === "weekly") {
            let current = new Date(start);
            let count = 0;
            // Limit weekly view to 104 weeks (2 years)
            while (current <= end && count < 104) {
                dateList.push(new Date(current));
                current.setDate(current.getDate() + 7);
                count++;
            }
        } else if (viewMode === "monthly") {
            // First day of each month starting from start month
            let current = new Date(start.getFullYear(), start.getMonth(), 1);
            let count = 0;
            // Limit monthly view to 60 months (5 years)
            while (current <= end && count < 60) {
                dateList.push(new Date(current));
                current.setMonth(current.getMonth() + 1);
                count++;
            }
        }
    }

    // Render Table Header (Months and Days)
    const tableHead = document.getElementById("gantt-grid-head");
    const tableBody = document.getElementById("gantt-grid-body");

    if (tableHead && tableBody) {
        tableHead.innerHTML = "";
        tableBody.innerHTML = "";

        if (dateList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 30px; color: var(--text-muted);">กรุณากำหนดวันเริ่มต้นและวันสิ้นสุดแผนงานด้านบน</td></tr>`;
        } else {
            const viewMode = project.ganttData.viewMode || "daily";

            // Grouping by Month or Year
            const monthGroups = [];
            const monthThaiNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
            
            if (viewMode === "monthly") {
                // Group by Thai Year name
                dateList.forEach(d => {
                    const yTh = d.getFullYear() + 543;
                    const yName = "ปี พ.ศ. " + yTh;
                    let grp = monthGroups.find(g => g.name === yName);
                    if (!grp) {
                        grp = { name: yName, colspan: 0 };
                        monthGroups.push(grp);
                    }
                    grp.colspan++;
                });
            } else {
                // Group by Thai Month name (Daily & Weekly)
                dateList.forEach(d => {
                    const mIdx = d.getMonth();
                    const yTh = d.getFullYear() + 543;
                    const mName = monthThaiNames[mIdx] + " " + yTh;
                    let grp = monthGroups.find(g => g.name === mName);
                    if (!grp) {
                        grp = { name: mName, colspan: 0 };
                        monthGroups.push(grp);
                    }
                    grp.colspan++;
                });
            }

            // Head Row 1: Columns (Font size increased & bolded)
            let tr1 = `<tr style="background: #e0e7ff; border: 1px solid var(--border-color); text-align: center;">
                <th rowspan="2" style="padding: 10px; width: 65px; min-width: 65px; max-width: 65px; border: 1px solid var(--border-color); font-size: 13.5px; font-weight: 700;">Items</th>
                <th rowspan="2" style="padding: 10px; width: 250px; min-width: 250px; max-width: 250px; text-align: left; border: 1px solid var(--border-color); font-size: 13.5px; font-weight: 700;">Description</th>`;
            monthGroups.forEach(grp => {
                tr1 += `<th colspan="${grp.colspan}" style="padding: 8px; border: 1px solid var(--border-color); font-size: 13px; font-weight: 700; color: var(--navy-dark);">${grp.name}</th>`;
            });
            tr1 += `<th rowspan="2" class="hide-accounting hide-customer" style="padding: 10px; width: 50px; min-width: 50px; max-width: 50px; border: 1px solid var(--border-color); font-size: 13px; font-weight: 700;">ลบ</th></tr>`;

            // Head Row 2: Days / Weeks / Months
            let tr2 = `<tr style="background: #f1f5f9; text-align: center;">`;
            dateList.forEach((d, i) => {
                let label = "";
                let cellWidthStyle = "width: 18px; min-width: 18px; max-width: 18px;";
                if (viewMode === "daily") {
                    label = d.getDate();
                } else if (viewMode === "weekly") {
                    label = `W${i + 1} (${d.getDate()})`;
                    cellWidthStyle = "width: 50px; min-width: 50px; max-width: 50px;";
                } else if (viewMode === "monthly") {
                    label = monthThaiNames[d.getMonth()].substring(0, 3);
                    cellWidthStyle = "width: 55px; min-width: 55px; max-width: 55px;";
                }
                tr2 += `<th style="padding: 4px 2px; border: 1px solid var(--border-color); font-weight: 700; font-size: 10.5px; ${cellWidthStyle} text-align: center;">${label}</th>`;
            });
            tr2 += `</tr>`;

            tableHead.innerHTML = tr1 + tr2;

            // Render Table Body
            if (project.ganttData.tasks.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="${3 + dateList.length}" style="text-align:center; padding: 40px; color: var(--text-muted); font-style: italic;">ยังไม่มีรายการงาน — กดปุ่มด้านบนเพื่อเพิ่มแถว</td></tr>`;
            } else {
                project.ganttData.tasks.forEach((task, idx) => {
                    // Backward compatibility migration
                    if (!task.rowType) {
                        if (task.isHeader) {
                            task.rowType = 'phase';
                        } else {
                            task.rowType = 'task';
                        }
                    }

                    const tr = document.createElement("tr");
                    tr.style.borderBottom = "1px solid var(--border-color)";
                    tr.setAttribute("data-row-idx", idx);

                    const readonlyAttr = canEdit ? '' : 'readonly';
                    const inputStyle = `style="width: 100%; font-size: 12.5px; font-weight: 700; padding: 5px 6px; border: 1px solid transparent; background: transparent; text-align: center; color: var(--navy-dark);"`;
                    const editStyle = `style="width: 100%; font-size: 12.5px; font-weight: 700; padding: 5px 6px; border: 1px solid var(--border-color); border-radius: 4px; background: #fff; text-align: center; color: var(--navy-dark);"`;

                    if (task.rowType === 'phase') {
                        // Level 1: Phase (Spans all columns, light gray background)
                        tr.style.background = "#e2e8f0";
                        tr.style.fontWeight = "700";
                        tr.innerHTML = `
                            <td style="padding: 6px; text-align: center; border: 1px solid var(--border-color); width: 65px;">
                                <input type="text" class="gantt-item-num" data-idx="${idx}" value="${task.itemNum || ''}" ${readonlyAttr} ${canEdit ? editStyle : inputStyle} placeholder="เช่น Phase 1">
                            </td>
                            <td colspan="${dateList.length + 1}" style="padding: 6px; border: 1px solid var(--border-color);">
                                <textarea class="gantt-item-name" data-idx="${idx}" ${readonlyAttr} onclick="this.focus()" style="width: 100%; font-size: 14px; font-weight: 800; padding: 6px 8px; border: 1px solid ${canEdit ? 'var(--border-color)' : 'transparent'}; border-radius: 4px; background: ${canEdit ? '#fff' : 'transparent'}; color: var(--navy-dark); resize: none; overflow: hidden; height: auto;" placeholder="Phase เช่น Phase 1 ปรับปรุงพื้นที่แผนกต้อนรับ..." rows="1" oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px';" onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">${task.name || ''}</textarea>
                            </td>
                            <td class="hide-accounting hide-customer" style="padding: 6px; text-align: center; border: 1px solid var(--border-color); width: 50px;">
                                ${canEdit ? `<button class="btn-delete-gantt-row" data-idx="${idx}" style="background:none; border:none; color:#e63946; cursor:pointer; font-size:12px;"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                            </td>
                        `;
                    } else if (task.rowType === 'type') {
                        // Level 2: ประเภทงาน (Spans all columns, light blue background)
                        tr.style.background = "#eff6ff";
                        tr.style.fontWeight = "700";
                        tr.innerHTML = `
                            <td style="padding: 6px; text-align: center; border: 1px solid var(--border-color); width: 65px;">
                                <input type="text" class="gantt-item-num" data-idx="${idx}" value="${task.itemNum || ''}" ${readonlyAttr} ${canEdit ? editStyle : inputStyle} placeholder="เช่น 1.1">
                            </td>
                            <td colspan="${dateList.length + 1}" style="padding: 6px; border: 1px solid var(--border-color);">
                                <textarea class="gantt-item-name" data-idx="${idx}" ${readonlyAttr} onclick="this.focus()" style="width: 100%; font-size: 13px; font-weight: 800; color: #1e40af; padding: 6px 8px; border: 1px solid ${canEdit ? 'var(--border-color)' : 'transparent'}; border-radius: 4px; background: ${canEdit ? '#fff' : 'transparent'}; resize: none; overflow: hidden; height: auto;" placeholder="ประเภทงาน เช่น 1.1 งานรื้อถอน" rows="1" oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px';" onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">${task.name || ''}</textarea>
                            </td>
                            <td class="hide-accounting hide-customer" style="padding: 6px; text-align: center; border: 1px solid var(--border-color); width: 50px;">
                                ${canEdit ? `<button class="btn-delete-gantt-row" data-idx="${idx}" style="background:none; border:none; color:#e63946; cursor:pointer; font-size:12px;"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                            </td>
                        `;
                    } else if (task.rowType === 'category') {
                        // Level 3: หมวดงาน (Spans all columns, white background, bold underline)
                        tr.style.background = "#ffffff";
                        tr.style.fontWeight = "700";
                        tr.innerHTML = `
                            <td style="padding: 6px; text-align: center; border: 1px solid var(--border-color); width: 65px;">
                                <input type="text" class="gantt-item-num" data-idx="${idx}" value="${task.itemNum || ''}" ${readonlyAttr} ${canEdit ? editStyle : inputStyle} placeholder="เช่น 1.2.1">
                            </td>
                            <td colspan="${dateList.length + 1}" style="padding: 6px; border: 1px solid var(--border-color);">
                                <textarea class="gantt-item-name" data-idx="${idx}" ${readonlyAttr} onclick="this.focus()" style="width: 100%; font-size: 13px; font-weight: 800; padding: 6px 8px; border: 1px solid ${canEdit ? 'var(--border-color)' : 'transparent'}; border-radius: 4px; background: ${canEdit ? '#fff' : 'transparent'}; text-decoration: underline; color: #334155; resize: none; overflow: hidden; height: auto;" placeholder="หมวดงาน เช่น 1.2.1 หมวดงานผนัง" rows="1" oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px';" onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">${task.name || ''}</textarea>
                            </td>
                            <td class="hide-accounting hide-customer" style="padding: 6px; text-align: center; border: 1px solid var(--border-color); width: 50px;">
                                ${canEdit ? `<button class="btn-delete-gantt-row" data-idx="${idx}" style="background:none; border:none; color:#e63946; cursor:pointer; font-size:12px;"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                            </td>
                        `;
                    } else {
                        // Level 4: งานย่อย (Daily/Weekly/Monthly Grid Row)
                        const indent = task.isSubtask ? "padding-left: 20px;" : "";
                        const nameWeight = task.isSubtask ? "600" : "700";
                        
                        let rowHtml = `
                            <td style="padding: 6px; text-align: center; border: 1px solid var(--border-color); width: 65px; min-width: 65px; max-width: 65px;">
                                <input type="text" class="gantt-item-num" data-idx="${idx}" value="${task.itemNum || ''}" ${readonlyAttr} ${canEdit ? editStyle : inputStyle} placeholder="-">
                            </td>
                            <td style="padding: 6px; border: 1px solid var(--border-color); width: 250px; min-width: 250px; max-width: 250px;">
                                <div style="display: flex; align-items: center; gap: 4px; ${indent}">
                                    ${canEdit ? `<input type="checkbox" class="gantt-subtask-toggle" data-idx="${idx}" ${task.isSubtask ? 'checked' : ''} title="ย่อหน้าเป็นงานย่อย" style="margin-right: 4px;">` : (task.isSubtask ? '<span style="color:#64748b; margin-right:4px;">-</span>' : '')}
                                    <textarea class="gantt-item-name" data-idx="${idx}" ${readonlyAttr} onclick="this.focus()" style="width: 100%; font-size: 12.5px; padding: 6px 8px; border: 1px solid ${canEdit ? 'var(--border-color)' : 'transparent'}; border-radius: 4px; background: ${canEdit ? '#fff' : 'transparent'}; font-weight: ${nameWeight}; color: #334155; resize: none; overflow: hidden; height: auto;" placeholder="ชื่องานย่อย/รายการงาน" rows="1" oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px';" onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">${task.name || ''}</textarea>
                                </div>
                            </td>
                        `;

                        // Render timeline grid cells
                        dateList.forEach(d => {
                            const dStr = formatDateLocal(d);
                            const val = task.cells ? (task.cells[dStr] || 0) : 0;
                            let noise = 0;
                            let shift = null;
                            if (val) {
                                if (typeof val === 'object') {
                                    noise = val.noise || 0;
                                    shift = val.shift || null;
                                } else {
                                    noise = parseInt(val) || 0;
                                }
                            }
                            
                            let cellBg = "";
                            if (noise === 1) cellBg = "background-color: #fcd34d;"; // Yellow
                            else if (noise === 2) cellBg = "background-color: #22c55e;"; // Green
                            else if (noise === 3) cellBg = "background-color: #f87171;"; // Red

                            let triangleHtml = "";
                            if (shift === 'day') {
                                triangleHtml = `<div style="position: absolute; top: 0; left: 0; width: 0; height: 0; border-top: 11px solid #f97316; border-right: 11px solid transparent; pointer-events: none;"></div>`;
                            } else if (shift === 'night') {
                                triangleHtml = `<div style="position: absolute; top: 0; left: 0; width: 0; height: 0; border-top: 11px solid #000000; border-right: 11px solid transparent; pointer-events: none;"></div>`;
                            }
                            
                            let cellWidthStyle = "width: 18px; min-width: 18px; max-width: 18px;";
                            if (viewMode === "weekly") {
                                cellWidthStyle = "width: 50px; min-width: 50px; max-width: 50px;";
                            } else if (viewMode === "monthly") {
                                cellWidthStyle = "width: 55px; min-width: 55px; max-width: 55px;";
                            }

                            rowHtml += `
                                <td class="gantt-cell" data-row-idx="${idx}" data-date="${dStr}" style="position: relative; border: 1px solid var(--border-color); ${cellBg} cursor: ${canEdit ? 'crosshair' : 'default'}; user-select: none; ${cellWidthStyle} height: 32px;">
                                    ${triangleHtml}
                                </td>
                            `;
                        });

                        rowHtml += `
                            <td class="hide-accounting hide-customer" style="padding: 6px; text-align: center; border: 1px solid var(--border-color); width: 50px;">
                                ${canEdit ? `<button class="btn-delete-gantt-row" data-idx="${idx}" style="background:none; border:none; color:#e63946; cursor:pointer; font-size:12px;"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                            </td>
                        `;

                        tr.innerHTML = rowHtml;
                    }

                    // Row selection for insert-between
                    if (canEdit) {
                        tr.style.cursor = 'pointer';
                        if (idx === ganttSelectedRowIdx) {
                            tr.style.outline = '2px solid #3b82f6';
                            tr.style.outlineOffset = '-2px';
                            tr.style.background = tr.style.background || '';
                            if (task.rowType === 'task') {
                                tr.style.background = '#eff6ff';
                            }
                        }
                        tr.addEventListener('click', function(e) {
                            // Don't select row when clicking inputs, buttons, checkboxes, or painting cells
                            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.classList.contains('gantt-cell')) return;
                            const clickedIdx = parseInt(this.getAttribute('data-row-idx'));
                            if (ganttSelectedRowIdx === clickedIdx) {
                                ganttSelectedRowIdx = -1; // Deselect
                            } else {
                                ganttSelectedRowIdx = clickedIdx;
                            }
                            renderSubnavPlanWork(project);
                        });
                    }

                    tableBody.appendChild(tr);
                });

                // Attach subtask checkbox toggle listener
                tableBody.querySelectorAll(".gantt-subtask-toggle").forEach(chk => {
                    chk.addEventListener("change", function() {
                        const rIdx = parseInt(this.getAttribute("data-idx"));
                        const task = project.ganttData.tasks[rIdx];
                        if (task) {
                            task.isSubtask = this.checked;
                            window.ganttIsDirty = true;
                            renderSubnavPlanWork(project);
                        }
                    });
                });

                // Attach row delete listener
                tableBody.querySelectorAll(".btn-delete-gantt-row").forEach(btn => {
                    btn.addEventListener("click", function() {
                        const rIdx = parseInt(this.getAttribute("data-idx"));
                        if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
                            project.ganttData.tasks.splice(rIdx, 1);
                            // Adjust selected row index after deletion
                            if (ganttSelectedRowIdx === rIdx) {
                                ganttSelectedRowIdx = -1;
                            } else if (ganttSelectedRowIdx > rIdx) {
                                ganttSelectedRowIdx--;
                            }
                            window.ganttIsDirty = true;
                            renderSubnavPlanWork(project);
                        }
                    });
                });

                // Attach paint mouse event listeners to cells
                if (canEdit) {
                    const cells = tableBody.querySelectorAll(".gantt-cell");
                    
                    const paintCell = (cell) => {
                        const rIdx = parseInt(cell.getAttribute("data-row-idx"));
                        const dStr = cell.getAttribute("data-date");
                        const task = project.ganttData.tasks[rIdx];
                        if (!task) return;
                        if (!task.cells) task.cells = {};

                        window.ganttIsDirty = true; // Mark dirty on color click/drag

                        // Decode existing cell value
                        const val = task.cells[dStr];
                        let noise = 0;
                        let shift = null;
                        if (val) {
                            if (typeof val === 'object') {
                                noise = val.noise || 0;
                                shift = val.shift || null;
                            } else {
                                noise = parseInt(val) || 0;
                            }
                        }

                        const updateCellTriangleDOM = (el, sh) => {
                            if (sh === 'day') {
                                el.innerHTML = `<div style="position: absolute; top: 0; left: 0; width: 0; height: 0; border-top: 11px solid #f97316; border-right: 11px solid transparent; pointer-events: none;"></div>`;
                            } else if (sh === 'night') {
                                el.innerHTML = `<div style="position: absolute; top: 0; left: 0; width: 0; height: 0; border-top: 11px solid #000000; border-right: 11px solid transparent; pointer-events: none;"></div>`;
                            } else {
                                el.innerHTML = "";
                            }
                        };

                        if (currentGanttBrush === 'red') {
                            noise = 3;
                            task.cells[dStr] = { noise, shift };
                            cell.style.backgroundColor = "#f87171";
                            updateCellTriangleDOM(cell, shift);
                        } else if (currentGanttBrush === 'yellow') {
                            noise = 1;
                            task.cells[dStr] = { noise, shift };
                            cell.style.backgroundColor = "#fcd34d";
                            updateCellTriangleDOM(cell, shift);
                        } else if (currentGanttBrush === 'green') {
                            noise = 2;
                            task.cells[dStr] = { noise, shift };
                            cell.style.backgroundColor = "#22c55e";
                            updateCellTriangleDOM(cell, shift);
                        } else if (currentGanttBrush === 'orange') {
                            shift = 'day';
                            if (noise === 0) noise = 2; // Default to green noise if none
                            task.cells[dStr] = { noise, shift };
                            cell.style.backgroundColor = noise === 3 ? "#f87171" : (noise === 1 ? "#fcd34d" : "#22c55e");
                            updateCellTriangleDOM(cell, shift);
                        } else if (currentGanttBrush === 'black') {
                            shift = 'night';
                            if (noise === 0) noise = 2; // Default to green noise if none
                            task.cells[dStr] = { noise, shift };
                            cell.style.backgroundColor = noise === 3 ? "#f87171" : (noise === 1 ? "#fcd34d" : "#22c55e");
                            updateCellTriangleDOM(cell, shift);
                        } else {
                            // Eraser
                            delete task.cells[dStr];
                            cell.style.backgroundColor = "";
                            updateCellTriangleDOM(cell, null);
                        }
                    };

                    cells.forEach(cell => {
                        cell.addEventListener("mousedown", function(e) {
                            e.preventDefault();
                            isGanttPainting = true;
                            paintCell(this);
                        });

                        cell.addEventListener("mouseenter", function() {
                            if (isGanttPainting) {
                                paintCell(this);
                            }
                        });
                    });

                    // Add global mouseup to stop painting
                    const stopPainting = () => { isGanttPainting = false; };
                    document.removeEventListener("mouseup", stopPainting);
                    document.addEventListener("mouseup", stopPainting);
                }
            }
        }

        // Auto-resize Gantt task textareas to fit content on load
        tableBody.querySelectorAll(".gantt-item-name").forEach(tx => {
            tx.style.height = 'auto';
            tx.style.height = tx.scrollHeight + 'px';
        });
    }

    // Attach local input sync listeners
    if (canEdit && tableBody) {
        // Sync item number and name in real-time
        tableBody.addEventListener("input", function(e) {
            const idx = parseInt(e.target.getAttribute("data-idx"));
            const task = project.ganttData.tasks[idx];
            if (!task) return;

            window.ganttIsDirty = true; // Mark dirty on typing name/number

            if (e.target.classList.contains("gantt-item-num")) {
                task.itemNum = e.target.value.trim();
            } else if (e.target.classList.contains("gantt-item-name")) {
                task.name = e.target.value.trim();
            }
        });
    }

    // ---- Render Plan Documents Section ----
    const docsContainer = document.getElementById("plan-docs-container");
    if (docsContainer) {
        docsContainer.innerHTML = "";
        if (!project.planDocs) project.planDocs = [];
        
        if (project.planDocs.length === 0) {
            docsContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-style: italic; padding: 20px; font-size: 13px;">ยังไม่มีหนังสือขอเข้างานสำหรับโครงการนี้</div>`;
        } else {
            // Sort planDocs (Work Permit Letters) by date (newest first)
            const sortedDocs = project.planDocs
                .map((doc, originalIdx) => ({ ...doc, originalIdx }))
                .sort((a, b) => {
                    const parseDate = (dStr) => {
                        if (!dStr) return new Date(0);
                        const parts = dStr.split('/');
                        if (parts.length === 3) {
                            const d = parseInt(parts[0]);
                            const m = parseInt(parts[1]) - 1;
                            let y = parseInt(parts[2]);
                            if (y > 2500) y -= 543;
                            return new Date(y, m, d);
                        }
                        return new Date(dStr);
                    };
                    return parseDate(b.date) - parseDate(a.date);
                });

            sortedDocs.forEach((doc) => {
                const ext = doc.file.split('.').pop().toLowerCase();
                let iconClass = "fa-solid fa-file-lines";
                let iconColor = "var(--text-muted)";
                let fileTypeLabel = "เอกสาร";
                if (ext === "pdf") { iconClass = "fa-solid fa-file-pdf"; iconColor = "#e63946"; fileTypeLabel = "PDF"; }
                else if (ext === "xlsx" || ext === "xls") { iconClass = "fa-solid fa-file-excel"; iconColor = "#2a9d8f"; fileTypeLabel = "Excel"; }
                else if (["png","jpg","jpeg"].includes(ext)) { iconClass = "fa-solid fa-file-image"; iconColor = "#457b9d"; fileTypeLabel = "รูปภาพ"; }
                
                const canDel = (appState.currentRole === "pm" || appState.currentRole === "admin") && appState.selectedDetailProject !== "all";
                const deleteBtn = canDel ? `<button class="btn-delete-plan-doc" data-idx="${doc.originalIdx}" title="ลบไฟล์" style="background:none;border:none;color:#e63946;cursor:pointer;padding:4px;font-size:14px;"><i class="fa-solid fa-trash-can"></i></button>` : '';
                
                const card = document.createElement("div");
                card.className = "plan-doc-card";
                card.style = "border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: var(--card-bg); display: flex; align-items: center; gap: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease; box-shadow: var(--shadow-sm);";
                card.innerHTML = `
                    <div style="font-size:24px;width:40px;height:40px;border-radius:6px;display:flex;align-items:center;justify-content:center;background:var(--bg-light);color:${iconColor};flex-shrink:0;"><i class="${iconClass}"></i></div>
                    <div style="flex-grow:1;min-width:0;">
                        <div style="font-weight:600;font-size:13px;color:var(--navy-dark);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${doc.title}">${doc.title}</div>
                        <div style="font-size:10px;color:var(--text-muted);display:flex;justify-content:space-between;margin-top:4px;align-items:center;">
                            <span>อัปเมื่อ ${doc.date}</span>
                            <span class="badge" style="background:var(--bg-light);padding:2px 6px;border-radius:4px;font-size:9px;font-weight:600;">${fileTypeLabel}</span>
                        </div>
                    </div>
                    <div style="display:flex;gap:6px;align-items:center;flex-shrink:0;">
                        ${ext === "pdf" ? `<button class="btn-view-plan-doc" data-file="${doc.file}" data-url="${doc.fileUrl || ''}" data-title="${doc.title}" title="ดู PDF" style="background:none;border:none;color:var(--primary-blue);cursor:pointer;padding:4px;font-size:15px;"><i class="fa-solid fa-eye"></i></button>` : ''}
                        <a href="${doc.fileUrl || '#'}" download="${doc.file}" class="btn-download" title="ดาวน์โหลด" style="color:var(--primary-blue);font-size:15px;padding:4px;"><i class="fa-solid fa-circle-down"></i></a>
                        ${deleteBtn}
                    </div>
                `;
                docsContainer.appendChild(card);
            });
            
            docsContainer.querySelectorAll(".btn-delete-plan-doc").forEach(btn => {
                btn.addEventListener("click", function() { deletePlanDoc(parseInt(this.getAttribute("data-idx"))); });
            });
            docsContainer.querySelectorAll(".btn-view-plan-doc").forEach(btn => {
                btn.addEventListener("click", function() {
                    if (window.openPdfViewer) window.openPdfViewer(this.getAttribute("data-url"), this.getAttribute("data-file"), this.getAttribute("data-title"));
                });
            });
        }
    }
}


function deleteTask(taskId) {
    const project = projectsData[appState.selectedDetailProject];
    if (!project) return;
    
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการงานความคืบหน้านี้?")) {
        const index = project.tasks.findIndex(t => t.id === taskId);
        if (index > -1) {
            const deleted = project.tasks.splice(index, 1);
            showToast(`ลบรายการงาน: ${deleted[0].title} สำเร็จ!`, "success");
            saveToLocalStorage();
            renderSubnavActualProgress(project);
        }
    }
}

// Modal for viewing A4 daily report document on screen
window.openDailyReportPreviewModal = async function(rep, project) {
    let modal = document.getElementById("daily-report-preview-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "daily-report-preview-modal";
        modal.className = "modal-overlay";
        modal.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 12000; backdrop-filter: blur(4px);";
        document.body.appendChild(modal);
    }
    
    // Resolve images asynchronously
    const resolvedImages = [];
    for (const imgKey of (rep.images || [])) {
        if (imgKey.startsWith("FILE:")) {
            try {
                const { data } = await supabaseClient.from('projects').select('data').eq('code', imgKey).single();
                if (data && data.data && data.data.fileUrl) {
                    resolvedImages.push(data.data.fileUrl);
                }
            } catch(e) { console.error(e); }
        } else {
            resolvedImages.push(imgKey);
        }
    }

    // Resolve signatures asynchronously
    const resolvedSignatures = [];
    for (const sig of (rep.signatures || [])) {
        let resolvedImg = "";
        if (sig.image && sig.image.startsWith("FILE:")) {
            try {
                const { data } = await supabaseClient.from('projects').select('data').eq('code', sig.image).single();
                if (data && data.data && data.data.fileUrl) {
                    resolvedImg = data.data.fileUrl;
                }
            } catch(e) { console.error(e); }
        } else {
            resolvedImg = sig.image;
        }
        resolvedSignatures.push({ name: sig.name, role: sig.role, image: resolvedImg });
    }

    const imagesHTML = resolvedImages.map(src => `
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; height: 120px; display: flex; justify-content: center; align-items: center; background: #fafafa; width: 120px;">
            <img src="${src}" style="max-width: 100%; max-height: 100%; object-fit: cover;">
        </div>
    `).join("");

    const signaturesHTML = resolvedSignatures.map(sig => `
        <div style="text-align: center; width: 140px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; font-size: 11px;">
            <img src="${sig.image}" style="max-width: 100px; max-height: 40px; object-fit: contain;">
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">( ........................................ )</div>
            <div style="font-weight: bold; color: #1e293b; margin-top: 2px;">${sig.name}</div>
            <div style="font-size: 10px; color: #64748b;">${sig.role}</div>
        </div>
    `).join("");

    window._currentPreviewReport = rep;

    modal.innerHTML = `
        <div style="background: #f1f5f9; border-radius: 12px; max-width: 800px; width: 90%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); animation: zoomIn 0.25s ease; border: 1px solid #cbd5e1;">
            <!-- Modal Header -->
            <div style="padding: 12px 20px; background: #1e293b; color: #fff; border-top-left-radius: 12px; border-top-right-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; font-size: 14px; font-family: 'Prompt', sans-serif;"><i class="fa-solid fa-file-lines mr-1"></i> รายงานการปฏิบัติงานฉบับเต็ม</span>
                <button onclick="document.getElementById('daily-report-preview-modal').remove()" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; line-height: 1;">&times;</button>
            </div>
            <!-- Modal Body (A4 Style Paper Container) -->
            <div style="padding: 24px; overflow-y: auto; flex: 1; background: #64748b; display: block;">
                <div style="width: 100%; max-width: 700px; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; padding: 40px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); font-family: 'Prompt', sans-serif; display: flex; flex-direction: column; gap: 20px; min-height: 800px; text-align: left; margin: 0 auto;">
                    
                    <!-- 1. Letterhead -->
                    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #334155; padding-bottom: 12px; gap: 20px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="logo.png" style="height: 55px; width: auto; object-fit: contain;" alt="TW Logo">
                            <div style="display: flex; flex-direction: column; text-align: left;">
                                <span style="font-size: 14px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.4px;">TECHNICAL WATER CO., LTD.</span>
                                <span style="font-size: 11px; font-weight: 700; color: #334155;">บริษัท เทคนิคอล วอเตอร์ จำกัด</span>
                            </div>
                        </div>
                        <div style="text-align: right; font-size: 9px; color: #475569; line-height: 1.4;">
                            <div>301/856 ซอยรามคำแหง 68 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240</div>
                            <div>เบอร์โทร (Tel.) 02-735-3022 | E-mail: technicalwater2015@gmail.com</div>
                        </div>
                    </div>

                    <!-- 2. Document Title -->
                    <div style="text-align: center; margin: 8px 0;">
                        <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; text-decoration: underline; margin: 0;">รายงานการปฏิบัติงานรายวัน (Daily Report)</h3>
                    </div>

                    <!-- 3. Details Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
                        <div style="display: flex; gap: 8px; font-size: 12.5px;">
                            <span style="color: #475569; font-weight: 600; min-width: 60px;">วันที่:</span>
                            <span style="color: #0f172a; font-weight: 500;">${rep.date}</span>
                        </div>
                        <div style="display: flex; gap: 8px; font-size: 12.5px;">
                            <span style="color: #475569; font-weight: 600; min-width: 60px;">สถานที่:</span>
                            <span style="color: #0f172a; font-weight: 500;">${project.customer}</span>
                        </div>
                        <div style="display: flex; gap: 8px; font-size: 12.5px;">
                            <span style="color: #475569; font-weight: 600; min-width: 60px;">เลข PO:</span>
                            <span style="color: #0f172a; font-weight: 500;">${project.code}</span>
                        </div>
                        <div style="display: flex; gap: 8px; font-size: 12.5px;">
                            <span style="color: #475569; font-weight: 600; min-width: 60px;">ชื่องาน:</span>
                            <span style="color: #0f172a; font-weight: 500;">${project.name}</span>
                        </div>
                    </div>

                    <!-- 4. Description -->
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <span style="font-size: 12px; font-weight: 700; color: #0f172a; border-left: 3px solid #1e3a8a; padding-left: 8px;">รายละเอียดการปฏิบัติงานประจำวัน</span>
                        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; font-size: 12.5px; color: #334155; line-height: 1.6; white-space: pre-wrap; min-height: 120px;">${rep.desc}</div>
                    </div>

                    <!-- 5. Photo Gallery -->
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <span style="font-size: 12px; font-weight: 700; color: #0f172a; border-left: 3px solid #1e3a8a; padding-left: 8px;">รูปภาพการปฏิบัติงาน</span>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap; background: #fafafa; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 6px; min-height: 40px; justify-content: center;">
                            ${imagesHTML || '<div style="color: #94a3b8; font-size: 12px;">ไม่มีรูปภาพประกอบ</div>'}
                        </div>
                    </div>

                    <!-- 6. Signatures -->
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 16px;">
                        <span style="font-size: 12px; font-weight: 700; color: #0f172a; border-left: 3px solid #1e3a8a; padding-left: 8px;">ผู้รับรองการปฏิบัติงาน</span>
                        <div style="display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; margin-top: 6px;">
                            ${signaturesHTML || '<div style="color: #94a3b8; font-size: 12px;">ไม่มีรายชื่อผู้รับรอง</div>'}
                        </div>
                    </div>
                </div>
            </div>
            <!-- Modal Footer -->
            <div style="padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; gap: 8px;">
                <button class="btn btn-sm btn-outline-green" onclick="window.exportDailyReportPDF(window._currentPreviewReport.date, window._currentPreviewReport.desc, window._currentPreviewReport.images, window._currentPreviewReport.signatures)" style="font-size: 12px; padding: 6px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; background: #f0fdf4; border: 1px solid #10b981; color: #16a34a;">
                    <i class="fa-solid fa-file-pdf"></i> ส่งออก PDF
                </button>
                <button class="btn btn-sm btn-primary" onclick="document.getElementById('daily-report-preview-modal').remove()" style="font-size: 12px; padding: 6px 16px; border-radius: 6px; cursor: pointer;">ปิด</button>
            </div>
        </div>
    `;

    modal.classList.add("active");
};

function renderSubnavDailyReports(project) {
    const container = document.getElementById("project-daily-reports-container");
    if (!container) return;
    
    container.innerHTML = "";
    
    const reports = project.dailyReports || [];
    
    // Compute badge counts
    const isReportSigned = (rep) => rep.signatures && (rep.signatures.length >= 2 || rep.signatures.some(sig => sig.image && sig.image.includes(":customer:")));
    
    const allCount = reports.length;
    const signedCount = reports.filter(isReportSigned).length;
    const unsignedCount = allCount - signedCount;
    
    const countAllEl = document.getElementById("dr-count-all");
    const countSignedEl = document.getElementById("dr-count-signed");
    const countUnsignedEl = document.getElementById("dr-count-unsigned");
    
    if (countAllEl) countAllEl.textContent = allCount;
    if (countSignedEl) countSignedEl.textContent = signedCount;
    if (countUnsignedEl) countUnsignedEl.textContent = unsignedCount;
    
    // Sync active class on filter buttons to match appState.activeDailyReportFilter
    const activeFilter = appState.activeDailyReportFilter || "all";
    const filterTabsContainer = document.querySelector(".daily-report-filter-tabs");
    if (filterTabsContainer) {
        filterTabsContainer.querySelectorAll(".dr-filter-btn").forEach(btn => {
            if (btn.getAttribute("data-filter") === activeFilter) {
                btn.classList.add("active");
                btn.style.background = "var(--primary-blue)";
                btn.style.color = "#ffffff";
                btn.style.borderColor = "var(--primary-blue)";
                btn.style.fontWeight = "700";
            } else {
                btn.classList.remove("active");
                btn.style.background = "#ffffff";
                btn.style.color = "var(--navy-dark)";
                btn.style.borderColor = "var(--border-color)";
                btn.style.fontWeight = "600";
            }
        });
    }

    if (reports.length === 0) {
        container.innerHTML = `<div class="text-center text-muted py-4">ไม่มีรายงานการปฏิบัติงานรายวันสำหรับโครงการนี้</div>`;
        return;
    }

    // Filter reports list based on active filter
    let filteredReports = reports;
    if (activeFilter === "signed") {
        filteredReports = reports.filter(isReportSigned);
    } else if (activeFilter === "unsigned") {
        filteredReports = reports.filter(rep => !isReportSigned(rep));
    }
    
    if (filteredReports.length === 0) {
        container.innerHTML = `<div class="text-center text-muted py-4">ไม่มีรายงานการปฏิบัติงานรายวันสำหรับเงื่อนไขนี้</div>`;
        return;
    }
    
    const isPM = (appState.currentRole === "pm" || appState.currentRole === "admin" || appState.currentRole === "pe");
    const isCustomer = (appState.currentRole === "customer" || appState.currentRole === "technician" || appState.currentRole === "tech");
    
    filteredReports.forEach((rep) => {
        const idx = reports.indexOf(rep);
        const card = document.createElement("div");
        card.className = "feed-item";
        
        const actionsHTML = isPM 
            ? `
               <button class="btn btn-xs btn-outline-blue btn-edit-daily-report" 
                   data-idx="${idx}"
                   style="font-size: 10.5px; padding: 3px 8px; display: flex; align-items: center; gap: 4px; background: none; border: 1px solid #1d4ed8; color: #1d4ed8; border-radius: 4px; cursor: pointer;">
                   <i class="fa-solid fa-pen"></i> แก้ไข
               </button>
               <button class="btn btn-xs btn-outline-red btn-delete-daily-report" 
                   data-idx="${idx}"
                   style="font-size: 10.5px; padding: 3px 8px; display: flex; align-items: center; gap: 4px; background: none; border: 1px solid #ef4444; color: #ef4444; border-radius: 4px; cursor: pointer;">
                   <i class="fa-solid fa-trash-can"></i> ลบ
               </button>
              ` 
            : ``;

        card.style = "position: relative; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px; background: #fff; box-shadow: var(--card-shadow);";
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; color: var(--navy-dark); font-weight: 600;">
                    <i class="fa-solid fa-clock text-blue"></i>
                    <span>วันที่ ${rep.date}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge-status completed" style="background-color: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">เสร็จสิ้นวันนี้</span>
                    
                    <button class="btn btn-xs btn-outline-blue btn-customer-sign-report" 
                        data-idx="${idx}"
                        style="font-size: 10.5px; padding: 3px 8px; display: flex; align-items: center; gap: 4px; background: none; border: 1px solid #1d4ed8; color: #1d4ed8; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-signature"></i> ลูกค้าเซ็นรับรอง
                    </button>
                    
                    <button class="btn btn-xs btn-outline-green daily-report-export-pdf" 
                        data-idx="${idx}"
                        style="font-size: 10.5px; padding: 3px 8px; display: flex; align-items: center; gap: 4px; background: none; border: 1px solid #10b981; color: #10b981; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-file-pdf"></i> ส่งออก PDF
                    </button>
                    
                    ${rep.file ? `
                        <button class="btn btn-xs btn-outline-blue daily-report-view-pdf" 
                            data-file="${rep.file}" 
                            data-url="${rep.fileUrl || ''}" 
                            data-title="รายงานประจำวัน ${rep.date}"
                            style="font-size: 10.5px; padding: 3px 8px; display: flex; align-items: center; gap: 4px; background: none; border: 1px solid #1d4ed8; color: #1d4ed8; border-radius: 4px; cursor: pointer;">
                            <i class="fa-solid fa-eye"></i> ดู PDF แนบ
                        </button>
                    ` : ''}
                    ${actionsHTML}
                </div>
            </div>
            
            <div style="font-size: 12px; color: var(--text-dark); line-height: 1.6; white-space: pre-wrap; font-family: 'Prompt', sans-serif; margin-bottom: 12px;">${rep.desc}</div>
            
            <!-- Photo Grid inside feed item -->
            <div class="daily-photo-gallery" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; margin-bottom: 12px;"></div>
            
            <!-- Signatures list inside feed item -->
            <div class="daily-signatures-list" style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 12px; padding-top: 10px; border-top: 1px dashed #e2e8f0;"></div>
        `;
        
        container.appendChild(card);
        
        // Render photos asynchronously
        const photoGallery = card.querySelector(".daily-photo-gallery");
        if (rep.images && rep.images.length > 0) {
            rep.images.forEach(imgKey => {
                const imgEl = document.createElement("img");
                imgEl.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 100 100'%2F%3E";
                imgEl.style.cssText = "width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color); background: #f8fafc; cursor: zoom-in; transition: transform 0.2s;";
                
                // Fetch image asynchronously from Supabase
                if (imgKey.startsWith("FILE:")) {
                    supabaseClient.from('projects').select('data').eq('code', imgKey).single()
                        .then(({ data }) => {
                            if (data && data.data && data.data.fileUrl) {
                                imgEl.src = data.data.fileUrl;
                            }
                        })
                        .catch(err => console.error("Failed to load report photo:", err));
                } else {
                    imgEl.src = imgKey;
                }
                
                // Click to view large image modal
                imgEl.addEventListener("click", () => {
                    // Collect all photos in this report card
                    const gallery = imgEl.closest(".daily-photo-gallery");
                    const allImgs = gallery ? Array.from(gallery.querySelectorAll("img")).map(im => im.src).filter(s => s && !s.includes("data:image/svg")) : [imgEl.src];
                    const clickedIdx = allImgs.indexOf(imgEl.src);
                    window.openGalleryLightbox(allImgs, clickedIdx >= 0 ? clickedIdx : 0);
                });
                
                photoGallery.appendChild(imgEl);
            });
        } else {
            photoGallery.style.display = "none";
        }
        
        // Render signatures asynchronously
        const sigsList = card.querySelector(".daily-signatures-list");
        if (rep.signatures && rep.signatures.length > 0) {
            rep.signatures.forEach(sig => {
                const sigBox = document.createElement("div");
                sigBox.style.cssText = "display: flex; flex-direction: column; align-items: center; width: 130px; font-size: 10px; color: var(--navy-dark); text-align: center; border: 1px solid #f1f5f9; padding: 6px; border-radius: 6px; background: #fafafa;";
                
                const sigImg = document.createElement("img");
                sigImg.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 120 40'%2F%3E";
                sigImg.style.cssText = "width: 110px; height: 35px; object-fit: contain; border-bottom: 1px dashed #cbd5e1; margin-bottom: 4px; background: #fff; padding: 2px;";
                
                // Fetch signature image asynchronously
                if (sig.image && sig.image.startsWith("FILE:")) {
                    supabaseClient.from('projects').select('data').eq('code', sig.image).single()
                        .then(({ data }) => {
                            if (data && data.data && data.data.fileUrl) {
                                sigImg.src = data.data.fileUrl;
                            }
                        })
                        .catch(err => console.error("Failed to load signature:", err));
                } else if (sig.image) {
                    sigImg.src = sig.image;
                }
                
                const nameEl = document.createElement("span");
                nameEl.style.fontWeight = "700";
                nameEl.style.fontSize = "10.5px";
                nameEl.textContent = sig.name;
                
                const roleEl = document.createElement("span");
                roleEl.style.color = "var(--text-muted)";
                roleEl.style.fontSize = "9px";
                roleEl.textContent = sig.role;
                
                sigBox.appendChild(sigImg);
                sigBox.appendChild(nameEl);
                sigBox.appendChild(roleEl);
                sigsList.appendChild(sigBox);
            });
        } else {
            sigsList.style.display = "none";
        }
    });

    // Hook View PDF handler
    container.querySelectorAll(".daily-report-view-pdf").forEach(btn => {
        btn.addEventListener("click", function() {
            const fileUrl = this.getAttribute("data-url");
            const fileName = this.getAttribute("data-file");
            const title = this.getAttribute("data-title");
            if (window.openPdfViewer) window.openPdfViewer(fileUrl, fileName, title);
        });
    });

    // Hook Edit Daily Report handler
    container.querySelectorAll(".btn-edit-daily-report").forEach(btn => {
        btn.addEventListener("click", function() {
            const repIdx = parseInt(this.getAttribute("data-idx"));
            if (window.openDailyReportModal) window.openDailyReportModal(repIdx);
        });
    });

    // Hook Delete Daily Report handler
    container.querySelectorAll(".btn-delete-daily-report").forEach(btn => {
        btn.addEventListener("click", function() {
            const repIdx = parseInt(this.getAttribute("data-idx"));
            deleteDailyReport(repIdx);
        });
    });
    
    // Hook Export PDF handler
    container.querySelectorAll(".daily-report-export-pdf").forEach(btn => {
        btn.addEventListener("click", function() {
            const rIdx = parseInt(this.getAttribute("data-idx"));
            const repObj = reports[rIdx];
            if (repObj && window.exportDailyReportPDF) {
                window.exportDailyReportPDF(repObj.date, repObj.desc, repObj.images, repObj.signatures);
            }
        });
    });

    // Hook Customer Sign-off handler
    container.querySelectorAll(".btn-customer-sign-report").forEach(btn => {
        btn.addEventListener("click", function() {
            const rIdx = parseInt(this.getAttribute("data-idx"));
            if (window.openCustomerSignModal) {
                window.openCustomerSignModal(rIdx);
            }
        });
    });
}

function deleteDailyReport(idx) {
    const project = projectsData[appState.selectedDetailProject];
    if (!project) return;
    
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายงานประจำวันนี้?")) {
        const deleted = project.dailyReports.splice(idx, 1);
        showToast(`ลบรายงานประจำวัน: วันที่ ${deleted[0].date} สำเร็จ!`, "success");
        saveToLocalStorage();
        renderSubnavDailyReports(project);
    }
}

function deleteDocument(index) {
    const project = projectsData[appState.selectedDetailProject];
    if (!project) return;
    
    const docName = project.documents[index].name;
    project.documents.splice(index, 1);
    
    // Save and sync immediately
    saveToLocalStorage();
    
    showToast(`ลบไฟล์ ${docName} สำเร็จ!`, "success");
    renderSubnavProjectWorkspace();
}

function renderCostDashboardOverview() {
    if (!document.getElementById("cost-kpi-total-value")) return;
    const filterYear = appState.selectedCostYearFilter;
    const allProjects = Object.values(projectsData);
    const filteredProjects = filterYear === "all" 
        ? allProjects 
        : allProjects.filter(p => p.year === parseInt(filterYear));
        
    // Calculate KPIs
    let totalValue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    
    filteredProjects.forEach(p => {
        totalValue += p.value || 0;
        totalCost += p.cost || 0;
        totalProfit += p.profit || 0;
    });
    
    const avgMargin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;
    
    document.getElementById("cost-kpi-total-value").textContent = formatNumber(totalValue);
    document.getElementById("cost-kpi-total-cost").textContent = formatNumber(totalCost);
    document.getElementById("cost-kpi-total-profit").textContent = formatNumber(totalProfit);
    document.getElementById("cost-kpi-margin-rate").textContent = `${avgMargin.toFixed(1)}%`;
    
    // Draw Bar Chart
    renderCostOverallBarChart(filteredProjects);
    
    // Draw Donut Chart
    renderCostOverallDonutChart(filteredProjects);

    // Render Project Cost Summary Table
    renderProjectCostSummaryTable();
}

function renderCostOverallBarChart(projectsList) {
    if (typeof Chart === "undefined") return;
    try {
        const ctx = document.getElementById('costOverallBarChart').getContext('2d');
        if (costOverallBarChart) {
            costOverallBarChart.destroy();
        }
        
        const hospitals = [
            "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
            "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
            "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4",
            "อื่นๆ"
        ];
        
        const labels = hospitals.map(h => h.replace("โรงพยาบาล", ""));
        const values = new Array(hospitals.length).fill(0);
        const costs = new Array(hospitals.length).fill(0);
        const profits = new Array(hospitals.length).fill(0);
        
        projectsList.forEach(p => {
            let index = hospitals.indexOf(p.customer);
            if (index === -1) {
                index = hospitals.indexOf("อื่นๆ");
            }
            if (index !== -1) {
                values[index] += p.value || 0;
                costs[index] += p.cost || 0;
                profits[index] += p.profit || 0;
            }
        });
        
        costOverallBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'มูลค่าสัญญา (Value)',
                        data: values,
                        backgroundColor: '#1d3557', // Navy
                        borderRadius: 4
                    },
                    {
                        label: 'ค่าใช้จ่ายจริง (Cost)',
                        data: costs,
                        backgroundColor: '#f59e0b', // Amber/Orange
                        borderRadius: 4
                    },
                    ...(appState.currentRole !== 'pm' ? [{
                        label: 'กำไร (Profit)',
                        data: profits,
                        backgroundColor: '#10b981', // Green
                        borderRadius: 4
                    }] : [])
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { family: 'Prompt', size: 9 } }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { 
                            font: { family: 'Prompt', size: 8 }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { font: { family: 'Prompt', size: 8 } }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error drawing cost overall bar chart:", err);
    }
}

function renderCostOverallDonutChart(projectsList) {
    if (typeof Chart === "undefined") return;
    try {
        const ctx = document.getElementById('costOverallDonutChart').getContext('2d');
        if (costOverallDonutChart) {
            costOverallDonutChart.destroy();
        }
        
        let totalLaborCost = 0;
        let totalMaterialCost = 0;
        let totalOtherCost = 0;
        
        projectsList.forEach(p => {
            const costVal = p.cost || 0;
            const struct = p.costStructure || { labor: 33, material: 55, other: 12 };
            totalLaborCost += costVal * (struct.labor / 100);
            totalMaterialCost += costVal * (struct.material / 100);
            totalOtherCost += costVal * (struct.other / 100);
        });
        
        const aggregateCost = totalLaborCost + totalMaterialCost + totalOtherCost;
        const aggLaborPct = aggregateCost > 0 ? Math.round((totalLaborCost / aggregateCost) * 100) : 0;
        const aggMaterialPct = aggregateCost > 0 ? Math.round((totalMaterialCost / aggregateCost) * 100) : 0;
        const aggOtherPct = aggregateCost > 0 ? 100 - aggLaborPct - aggMaterialPct : 0;
        
        costOverallDonutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    `ค่าแรง ${aggLaborPct}%`,
                    `ค่าวัสดุ ${aggMaterialPct}%`,
                    `ค่าใช้จ่ายอื่น ${aggOtherPct}%`
                ],
                datasets: [{
                    data: [totalLaborCost, totalMaterialCost, totalOtherCost],
                    backgroundColor: ['#1d3557', '#10b981', '#f59e0b'],
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
                        position: 'bottom',
                        labels: {
                            boxWidth: 10,
                            font: { size: 9, family: 'Prompt' }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error drawing cost overall donut chart:", err);
    }
}

function renderProjectCostSummaryTable() {
    const tbody = document.getElementById("project-cost-summary-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const costDetailYearFilter = document.getElementById("cost-detail-year-filter");
    const costDetailHospitalSelector = document.getElementById("cost-detail-hospital-selector");
    const yearVal = costDetailYearFilter ? costDetailYearFilter.value : "all";
    const hospitalVal = costDetailHospitalSelector ? costDetailHospitalSelector.value : "all";

    // Filter projects based on Year and Hospital of Part B selectors
    const allProjects = Object.values(projectsData);
    const filteredProjects = allProjects.filter(p => {
        const hospitalMatch = hospitalVal === "all" || p.customer === hospitalVal;
        const yearMatch = yearVal === "all" || p.year === parseInt(yearVal);
        return hospitalMatch && yearMatch;
    });

    // Sort projects by value descending (largest first)
    const sortedProjects = filteredProjects.sort((a, b) => (b.value || 0) - (a.value || 0));

    // Pagination logic
    const totalItems = sortedProjects.length;
    const PAGE_SIZE = 10;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

    if (!appState.projectCostCurrentPage) {
        appState.projectCostCurrentPage = 1;
    }
    if (appState.projectCostCurrentPage > totalPages) {
        appState.projectCostCurrentPage = totalPages;
    }
    if (appState.projectCostCurrentPage < 1) {
        appState.projectCostCurrentPage = 1;
    }

    const startIdx = (appState.projectCostCurrentPage - 1) * PAGE_SIZE;
    const pageProjects = sortedProjects.slice(startIdx, startIdx + PAGE_SIZE);

    if (pageProjects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: var(--text-muted);">ไม่มีข้อมูลโครงการสำหรับตัวกรองนี้</td></tr>`;
        
        // Hide pagination if empty
        const paginationEl = document.getElementById("project-cost-pagination");
        if (paginationEl) paginationEl.innerHTML = "";
        return;
    }

    pageProjects.forEach(p => {
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";
        
        // Highlight row if currently selected in the detail view
        const isSelected = p.code === appState.selectedCostProject;
        if (isSelected) {
            tr.style.backgroundColor = "rgba(37, 99, 235, 0.08)";
        }
        
        tr.onclick = function() {
            // Select this project in Part B dropdown and render details
            appState.selectedCostProject = p.code;
            const costProjSel = document.getElementById("cost-project-selector");
            if (costProjSel) {
                costProjSel.value = p.code;
                // Trigger change event to load details
                const event = new Event('change');
                costProjSel.dispatchEvent(event);
            }
            // Scroll down smoothly to the details section below
            const detailsSection = document.getElementById("cost-details-section");
            if (detailsSection) {
                detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        const val = p.value || 0;
        const cost = p.cost || 0;
        const profit = val - cost;
        const pct = val > 0 ? ((profit / val) * 100).toFixed(1) : "0.0";
        
        let statusBadge = "";
        if (p.status === "งานที่กำลังเสนอราคา" || p.status === "กำลังเสนอราคา") {
            statusBadge = `<span class="badge-status-normal orange" style="font-size: 10px; padding: 2px 8px;">เสนอราคา</span>`;
        } else if (p.status === "ปิดโครงการแล้ว" || p.status === "เสร็จสิ้นโครงการ") {
            statusBadge = `<span class="badge-status-normal green" style="font-size: 10px; padding: 2px 8px;">ปิดโครงการ</span>`;
        } else {
            statusBadge = `<span class="badge-status-normal blue" style="font-size: 10px; padding: 2px 8px;">ดำเนินการ</span>`;
        }

        tr.innerHTML = `
            <td style="padding: 10px 12px; font-weight: 700; color: var(--navy-dark); text-align: center;">${p.code}</td>
            <td style="padding: 10px 12px;">
                <strong style="color: var(--navy-dark); font-size: 12px;">${p.name.replace(/ \(\d{4}\)$/, '')}</strong>
                <div style="font-size: 10.5px; color: var(--text-muted);">${p.customer || "-"}</div>
            </td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: var(--navy-dark);">${formatNumber(val)}</td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #c2410c;">${formatNumber(cost)}</td>
            <td class="hide-pm" style="padding: 10px 12px; text-align: right; font-weight: 600; color: ${profit >= 0 ? '#15803d' : '#dc2626'};">${formatNumber(profit)}</td>
            <td class="hide-pm" style="padding: 10px 12px; text-align: center;">
                <span class="badge-percent" style="font-size: 11px; padding: 2px 6px; background: ${profit >= 0 ? '#dcfce7; color: #15803d' : '#fee2e2; color: #dc2626'}; border-radius: 4px; font-weight: 600;">${pct}%</span>
            </td>
            <td style="padding: 10px 12px; font-size: 11.5px; color: var(--text-dark);">${p.manager || "-"}</td>
            <td style="padding: 10px 12px; text-align: center;">${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });

    // Render pagination controls
    const paginationEl = document.getElementById("project-cost-pagination");
    if (paginationEl) {
        if (totalPages <= 1) {
            paginationEl.innerHTML = "";
        } else {
            const prevDisabled = appState.projectCostCurrentPage === 1 ? "disabled style='opacity: 0.4; cursor: not-allowed; font-family: Prompt; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: #f3f4f6; color: var(--text-muted);'" : "style='font-family: Prompt; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: #ffffff; color: var(--navy-dark); cursor: pointer;'";
            const nextDisabled = appState.projectCostCurrentPage === totalPages ? "disabled style='opacity: 0.4; cursor: not-allowed; font-family: Prompt; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: #f3f4f6; color: var(--text-muted);'" : "style='font-family: Prompt; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: #ffffff; color: var(--navy-dark); cursor: pointer;'";
            
            paginationEl.innerHTML = `
                <button ${prevDisabled} id="proj-cost-prev-btn">
                    <i class="fa-solid fa-chevron-left mr-1"></i> ก่อนหน้า
                </button>
                <span style="font-family: &#39;Prompt&#39;; font-size: 12.5px; font-weight: 600; color: var(--navy-dark); margin: 0 10px;">
                    หน้า ${appState.projectCostCurrentPage} / ${totalPages} (${totalItems} รายการ)
                </span>
                <button ${nextDisabled} id="proj-cost-next-btn">
                    ถัดไป <i class="fa-solid fa-chevron-right ml-1"></i>
                </button>
            `;
            
            // Wire events
            const prevBtn = document.getElementById("proj-cost-prev-btn");
            if (prevBtn && appState.projectCostCurrentPage > 1) {
                prevBtn.onclick = function() {
                    appState.projectCostCurrentPage--;
                    renderProjectCostSummaryTable();
                };
            }
            
            const nextBtn = document.getElementById("proj-cost-next-btn");
            if (nextBtn && appState.projectCostCurrentPage < totalPages) {
                nextBtn.onclick = function() {
                    appState.projectCostCurrentPage++;
                    renderProjectCostSummaryTable();
                };
            }
        }
    }
}

// 4. Cost Management View (Section 4)
function renderCostManagement() {
    // Render high-level Cost Dashboard Overview
    renderCostDashboardOverview();

    const activeCode = appState.selectedCostProject;
    const costDetailYearFilter = document.getElementById("cost-detail-year-filter");
    const costDetailHospitalSelector = document.getElementById("cost-detail-hospital-selector");
    const costSelector = document.getElementById("cost-project-selector");

    // Toggle between list view and details view
    const listView = document.getElementById("cost-projects-list-view");
    const detailView = document.getElementById("cost-project-detail-view");
    
    if (activeCode === "all") {
        if (listView) listView.style.display = "block";
        if (detailView) detailView.style.display = "none";
    } else {
        if (listView) listView.style.display = "none";
        if (detailView) detailView.style.display = "block";
        
        const proj = projectsData[activeCode];
        if (proj) {
            const nameHeader = document.getElementById("cost-detail-header-project-name");
            const descHeader = document.getElementById("cost-detail-header-project-desc");
            if (nameHeader) nameHeader.innerHTML = `<i class="fa-solid fa-folder-open text-blue mr-1"></i> [${proj.code}] ${proj.name}`;
            if (descHeader) descHeader.textContent = `${proj.customer || "-"} | ปีที่ดำเนินโครงการ: ${proj.year}`;
        }
    }

    let project;
    if (activeCode === "all") {
        const hospitalVal = costDetailHospitalSelector ? costDetailHospitalSelector.value : "all";
        const yearFilterVal = costDetailYearFilter ? costDetailYearFilter.value : "all";
        
        const matched = Object.values(projectsData).filter(p => {
            const hospitalMatch = hospitalVal === "all" || p.customer === hospitalVal;
            const yearMatch = yearFilterVal === "all" || p.year === parseInt(yearFilterVal);
            return hospitalMatch && yearMatch;
        });
        
        const totalValue = matched.reduce((sum, p) => sum + p.value, 0);
        const totalCost = matched.reduce((sum, p) => sum + p.cost, 0);
        const totalProfit = totalValue - totalCost;
        
        const allExpenses = [];
        matched.forEach(p => {
            if (p.expenses) {
                p.expenses.forEach(ex => {
                    allExpenses.push({ ...ex, projectCode: p.code });
                });
            }
        });
        
        // Sum cost breakdown categories
        let totalLabor = 0;
        let totalMaterial = 0;
        let totalOther = 0;
        allExpenses.forEach(e => {
            if (e.type === "ค่าแรง") totalLabor += e.amount;
            else if (e.type === "ค่าวัสดุ") totalMaterial += e.amount;
            else totalOther += e.amount;
        });
        
        project = {
            code: "ALL PROJECTS",
            name: `ภาพรวมสะสม (${matched.length} โครงการ)`,
            customer: hospitalVal === "all" ? "ทั้งหมดทุกโรงพยาบาล" : hospitalVal,
            year: yearFilterVal === "all" ? "ทั้งหมด" : parseInt(yearFilterVal),
            value: totalValue,
            cost: totalCost,
            profit: totalProfit,
            expenses: allExpenses,
            costStructure: {
                labor: totalCost > 0 ? (totalLabor / totalCost) * 100 : 33.3,
                material: totalCost > 0 ? (totalMaterial / totalCost) * 100 : 33.3,
                other: totalCost > 0 ? (totalOther / totalCost) * 100 : 33.4
            }
        };
    } else {
        project = projectsData[activeCode];
    }
    
    if (!project) {
        document.getElementById("cost-v-value").textContent = "0";
        document.getElementById("cost-v-cost").textContent = "0";
        document.getElementById("cost-v-profit").textContent = "0";
        document.getElementById("cost-v-net").textContent = "0";
        document.getElementById("cost-v-percent").textContent = "0.00%";
        
        const tbody = document.getElementById("transaction-table-body");
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">ไม่มีรายการบันทึกค่าใช้จ่าย</td></tr>`;
        
        renderCostStructureDonutChart({ labor: 0, material: 0, other: 0 });
        return;
    }

    if (costSelector && costSelector.value !== activeCode) {
        costSelector.value = activeCode;
    }

    // Toggle visibility of add expense button
    const openExpenseBtn = document.getElementById("open-expense-modal-btn");
    if (openExpenseBtn) {
        openExpenseBtn.style.display = activeCode === "all" ? "none" : "";
    }

    // A. Bind Financial summary
    const pct = project.value > 0 ? ((project.profit / project.value) * 100).toFixed(2) : "0.00";
    
    document.getElementById("cost-v-value").textContent = formatNumber(project.value);
    document.getElementById("cost-v-cost").textContent = formatNumber(project.cost);
    document.getElementById("cost-v-profit").textContent = formatNumber(project.profit);
    document.getElementById("cost-v-net").textContent = formatNumber(project.profit);
    document.getElementById("cost-v-percent").textContent = `${pct}%`;

    // B. Bind Latest expenses table
    const tbody = document.getElementById("transaction-table-body");
    tbody.innerHTML = "";
    
    if (project.expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">ไม่มีรายการบันทึกค่าใช้จ่าย</td></tr>`;
    } else {
        project.expenses.forEach((exp, idx) => {
            const tr = document.createElement("tr");
            
            let expClass = "other";
            if (exp.type === "ค่าแรง") expClass = "labor";
            else if (exp.type === "ค่าวัสดุ") expClass = "material";
            
            const parts = exp.date.split("-");
            const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : exp.date;
            
            const canDelete = (appState.currentRole === "pm" || appState.currentRole === "admin") && activeCode !== "all";
            const deleteButtonHTML = canDelete 
                ? `<button class="btn-delete-row" data-idx="${idx}" title="ลบรายการ"><i class="fa-solid fa-trash-can"></i></button>`
                : `<button class="btn-delete-row" disabled style="opacity:0.3; cursor:not-allowed;" title="${activeCode === 'all' ? 'ไม่สามารถลบข้อมูลจากมุมมองภาพรวมได้' : 'ไม่มีสิทธิ์ลบข้อมูล'}"><i class="fa-solid fa-trash-can"></i></button>`;

            const fileHTML = exp.file ? 
                `<a href="#" class="btn-expense-view-pdf" data-url="${exp.fileUrl || ''}" data-file="${exp.file}" title="ดูเอกสารอ้างอิง: ${exp.file}" style="color: var(--primary-blue); font-size: 14px; cursor: pointer;"><i class="fa-solid fa-file-invoice-dollar"></i></a>` :
                `<span class="text-muted" style="font-size: 11px;">-</span>`;

            const displayTitle = exp.projectCode ? `[${exp.projectCode}] ${exp.title}` : exp.title;

            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td><strong>${displayTitle}</strong></td>
                <td><span class="badge-expense-type ${expClass}">${exp.type}</span></td>
                <td class="text-right"><strong>${formatNumber(exp.amount)}</strong></td>
                <td class="text-center">${fileHTML}</td>
                <td class="text-center action-col">${deleteButtonHTML}</td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll(".btn-delete-row").forEach(btn => {
            btn.addEventListener("click", function() {
                if (activeCode === "all") return;
                const expIdx = parseInt(this.getAttribute("data-idx"));
                deleteExpense(expIdx);
            });
        });

        tbody.querySelectorAll(".btn-expense-view-pdf").forEach(btn => {
            btn.addEventListener("click", function(e) {
                e.preventDefault();
                const fileUrl = this.getAttribute("data-url");
                const fileName = this.getAttribute("data-file");
                if (window.openPdfInNewTab) {
                    window.openPdfInNewTab(fileUrl, fileName);
                }
            });
        });
    }

    // C. Render Cost Donut Chart
    renderCostStructureDonutChart(project.costStructure);
    
    // Render pending disbursements
    if (typeof renderDisbursementPendingTable === "function") {
        renderDisbursementPendingTable();
    }
}

function renderCostStructureDonutChart(structure) {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }
    try {
        const ctx = document.getElementById('costStructureDonut').getContext('2d');
        
        if (costStructureDonut) {
            costStructureDonut.destroy();
        }

        const total = (structure.labor || 0) + (structure.material || 0) + (structure.other || 0);
        const isEmpty = total === 0;
        
        const chartData = isEmpty ? [1] : [structure.labor, structure.material, structure.other];
        const chartLabels = isEmpty 
            ? ["ยังไม่มีบันทึกต้นทุน"]
            : [
                `ค่าแรง ${(structure.labor || 0).toFixed(0)}%`, 
                `ค่าวัสดุ ${(structure.material || 0).toFixed(0)}%`, 
                `ค่าใช้จ่ายอื่น ${(structure.other || 0).toFixed(0)}%`
              ];
        const chartColors = isEmpty ? ['#f1f5f9'] : ['#10b981', '#3b82f6', '#f59e0b'];

        costStructureDonut = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: chartColors,
                    borderWidth: isEmpty ? 1 : 2,
                    borderColor: isEmpty ? '#e2e8f0' : '#ffffff',
                    hoverOffset: isEmpty ? 0 : 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 10,
                            font: { size: 9, family: 'Prompt' },
                            padding: 10
                        }
                    },
                    tooltip: {
                        enabled: !isEmpty
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error drawing cost structure donut:", err);
    }
}

function deleteExpense(index) {
    const project = projectsData[appState.selectedCostProject];
    if (!project) return;
    
    const exp = project.expenses[index];
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการ "${exp.title}"?`)) {
        project.expenses.splice(index, 1);
        recalculateCostStructure(project);
        saveToLocalStorage();
        
        showToast(`ลบรายการ ${exp.title} สำเร็จ!`, "success");
        renderCostManagement();
        renderOverallDashboard(); // Update main dashboard financial values as well
        if (appState.selectedDetailProject !== "all") {
            renderSubnavProjectWorkspace();
        }
        if (typeof updateBellBadge === "function") {
            updateBellBadge();
        }
    }
}

function recalculateCostStructure(project) {
    if (!project.costStructure) {
        project.costStructure = { labor: 0, material: 0, other: 0 };
    }
    
    if (!project.expenses || project.expenses.length === 0) {
        project.expenses = [];
        project.costStructure = { labor: 0, material: 0, other: 0 };
        project.cost = 0;
        project.profit = project.value || 0;
        return;
    }
    
    let laborSum = 0;
    let materialSum = 0;
    let otherSum = 0;
    
    project.expenses.forEach(e => {
        if (e.status === "รออนุมัติ" || e.status === "ปฏิเสธ") return; // Skip pending/rejected requests
        if (e.type === "ค่าแรง") laborSum += e.amount;
        else if (e.type === "ค่าวัสดุ") materialSum += e.amount;
        else otherSum += e.amount;
    });
    
    const sum = laborSum + materialSum + otherSum;
    project.cost = sum;
    project.profit = (project.value || 0) - sum;
    
    if (sum > 0) {
        project.costStructure.labor = parseFloat(((laborSum / sum) * 100).toFixed(1));
        project.costStructure.material = parseFloat(((materialSum / sum) * 100).toFixed(1));
        project.costStructure.other = parseFloat((100 - project.costStructure.labor - project.costStructure.material).toFixed(1));
    } else {
        project.costStructure = { labor: 0, material: 0, other: 0 };
    }
}

// 8. View: All Projects Table
function renderAllProjectsTable() {
    const tbody = document.getElementById("projects-list-table-body");
    tbody.innerHTML = "";
    
    Object.keys(projectsData).forEach(key => {
        const p = projectsData[key];
        const tr = document.createElement("tr");
        
        tr.innerHTML = `
            <td><strong>${p.code}</strong></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.customer}</td>
            <td>${p.manager}</td>
            <td>${p.start} - ${p.end}</td>
            <td class="text-right hide-customer"><strong>${formatNumber(p.value)} บาท</strong></td>
            <td>
                <div class="percent-display-row" style="min-width: 120px;">
                    <div class="progress-bar-bg flex-grow-1" style="height: 6px;">
                        <div class="progress-bar-fill blue-fill" style="width: ${p.progress}%"></div>
                    </div>
                    <strong>${p.progress}%</strong>
                </div>
            </td>
            <td><span class="badge-status success">${p.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}


// --- EVENT ATTACHMENTS & INTERACTION BOOTSTRAP ---
