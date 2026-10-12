document.addEventListener("DOMContentLoaded", () => {
    
    // Global File Download Click Interceptor for File Reference System
    document.addEventListener("click", async function(e) {
        const a = e.target.closest("a[download]");
        if (a) {
            const href = a.getAttribute("href");
            if (href && href.startsWith("FILE:")) {
                e.preventDefault();
                showToast("กำลังดึงไฟล์ดาวน์โหลด...", "info");
                try {
                    const actualUrl = await window.resolveFileUrl(href);
                    if (actualUrl) {
                        const tempA = document.createElement("a");
                        tempA.href = actualUrl;
                        tempA.download = a.getAttribute("download") || "downloaded-file";
                        document.body.appendChild(tempA);
                        tempA.click();
                        document.body.removeChild(tempA);
                        showToast("ดาวน์โหลดไฟล์สำเร็จ", "success");
                    } else {
                        throw new Error("ไม่พบไฟล์ในระบบ");
                    }
                } catch (err) {
                    showToast("ดาวน์โหลดไฟล์ล้มเหลว: " + err.message, "error");
                }
            }
        }
    });
    
    // Toggle "อื่นๆ" input fields for Create/Edit project hospital dropdowns
    const newHospSelect = document.getElementById("new-project-hospital");
    const newHospOtherGroup = document.getElementById("create-proj-hospital-other-group");
    const newHospOtherInput = document.getElementById("new-project-hospital-other");
    if (newHospSelect && newHospOtherGroup && newHospOtherInput) {
        newHospSelect.addEventListener("change", function() {
            if (this.value === "อื่นๆ") {
                newHospOtherGroup.style.display = "block";
                newHospOtherInput.setAttribute("required", "true");
            } else {
                newHospOtherGroup.style.display = "none";
                newHospOtherInput.removeAttribute("required");
                newHospOtherInput.value = "";
            }
        });
    }

    const editHospSelect = document.getElementById("edit-project-customer");
    const editHospOtherGroup = document.getElementById("edit-proj-customer-other-group");
    const editHospOtherInput = document.getElementById("edit-project-customer-other");
    if (editHospSelect && editHospOtherGroup && editHospOtherInput) {
        editHospSelect.addEventListener("change", function() {
            if (this.value === "อื่นๆ") {
                editHospOtherGroup.style.display = "block";
                editHospOtherInput.setAttribute("required", "true");
            } else {
                editHospOtherGroup.style.display = "none";
                editHospOtherInput.removeAttribute("required");
                editHospOtherInput.value = "";
            }
        });
    }

    // Mobile Sidebar Toggle Logic
    const mobileToggleBtn = document.getElementById("mobile-sidebar-toggle-btn");
    const sidebarEl = document.querySelector(".sidebar");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    
    const openMobileSidebar = () => {
        if (sidebarEl) sidebarEl.classList.add("active");
        if (sidebarOverlay) sidebarOverlay.style.display = "block";
    };
    
    const closeMobileSidebar = () => {
        if (sidebarEl) sidebarEl.classList.remove("active");
        if (sidebarOverlay) sidebarOverlay.style.display = "none";
    };
    window.closeMobileSidebar = closeMobileSidebar;
    
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openMobileSidebar();
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeMobileSidebar);
    }

    // 1. Sidebar Navigation Click Listeners
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
        item.addEventListener("click", function(e) {
            e.preventDefault();
            const viewName = this.getAttribute("data-view");
            
            if (viewName === "cost") {
                appState.selectedCostProject = "all";
                sessionStorage.setItem("technical_water_last_cost_project", "all");
                const costSelector = document.getElementById("cost-project-selector");
                if (costSelector) costSelector.value = "all";
                if (typeof switchCostMainTab === "function") {
                    switchCostMainTab("overview");
                }
            }
            
            // If clicking on the currently active tab (e.g. quoting-projects-list or projects-list), collapse and return to dashboard
            if (appState.currentView === viewName && (viewName === "quoting-projects-list" || viewName === "projects-list")) {
                switchView("dashboard");
            } else {
                switchView(viewName);
            }

            // On mobile, keep sidebar open for 'projects-list' or 'quoting-projects-list' so user can select project details
            if (appState.currentView !== "projects-list" && appState.currentView !== "quoting-projects-list") {
                closeMobileSidebar();
            }
        });
    });

    // 1.1 Header click to collapse subnav and return to dashboard
    const sidebarProjHeader = document.querySelector(".sidebar-project-header");
    if (sidebarProjHeader) {
        sidebarProjHeader.style.cursor = "pointer";
        sidebarProjHeader.title = "คลิกเพื่อย่อแท็บและกลับสู่หน้า Dashboard";
        sidebarProjHeader.addEventListener("click", function() {
            switchView("dashboard");
        });
    }

    // 1.1b Clickable Dashboard KPI cards setup
    const kpiTotalEl = document.getElementById("kpi-total-jobs");
    const kpiInprogressEl = document.getElementById("kpi-inprogress-jobs");
    const kpiFinishedEl = document.getElementById("kpi-finished-jobs");
    const kpiCompletedEl = document.getElementById("kpi-completed-jobs");
    const kpiPendingEl = document.getElementById("kpi-pending-approval-jobs");

    if (kpiTotalEl) {
        const card = kpiTotalEl.closest(".kpi-card");
        if (card) {
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                switchView("projects-list");
                const portalStatusFilter = document.getElementById("portal-status-filter");
                if (portalStatusFilter) {
                    portalStatusFilter.value = "all";
                }
                if (typeof window.renderProjectSelectionPortal === "function") {
                    window.renderProjectSelectionPortal();
                }
            });
        }
    }

    if (kpiInprogressEl) {
        const card = kpiInprogressEl.closest(".kpi-card");
        if (card) {
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                switchView("projects-list");
                const portalStatusFilter = document.getElementById("portal-status-filter");
                if (portalStatusFilter) {
                    portalStatusFilter.value = "งานที่กำลังดำเนินการ";
                }
                if (typeof window.renderProjectSelectionPortal === "function") {
                    window.renderProjectSelectionPortal();
                }
            });
        }
    }

    if (kpiFinishedEl) {
        const card = kpiFinishedEl.closest(".kpi-card");
        if (card) {
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                switchView("projects-list");
                const portalStatusFilter = document.getElementById("portal-status-filter");
                if (portalStatusFilter) {
                    portalStatusFilter.value = "งานที่ดำเนินการเสร็จแล้ว";
                }
                if (typeof window.renderProjectSelectionPortal === "function") {
                    window.renderProjectSelectionPortal();
                }
            });
        }
    }

    if (kpiCompletedEl) {
        const card = kpiCompletedEl.closest(".kpi-card");
        if (card) {
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                switchView("projects-list");
                const portalStatusFilter = document.getElementById("portal-status-filter");
                if (portalStatusFilter) {
                    portalStatusFilter.value = "งานเสร็จแล้วรอส่งงาน/อนุมัติ";
                }
                if (typeof window.renderProjectSelectionPortal === "function") {
                    window.renderProjectSelectionPortal();
                }
            });
        }
    }

    if (kpiPendingEl) {
        const card = kpiPendingEl.closest(".kpi-card");
        if (card) {
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                switchView("quoting-projects-list");
                const portalStatusFilter = document.getElementById("portal-status-filter");
                if (portalStatusFilter) {
                    portalStatusFilter.value = "งานที่รอเสนอราคา";
                }
                if (typeof window.renderProjectSelectionPortal === "function") {
                    window.renderProjectSelectionPortal();
                }
            });
        }
    }

    // 1.25 Cost Management Main Tab Switch
    window.switchCostMainTab = function(tabName) {
        document.querySelectorAll(".cost-main-tab-btn").forEach(btn => {
            const isMatch = btn.getAttribute("data-main-tab") === tabName;
            if (isMatch) {
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

        document.querySelectorAll(".cost-main-tab-panel").forEach(panel => {
            const isMatch = panel.id === `cost-main-panel-${tabName}`;
            panel.style.display = isMatch ? "block" : "none";
        });
        
        if (tabName === "overview") {
            renderCostDashboardOverview();
        } else if (tabName === "projects") {
            populateCostProjects();
        } else if (tabName === "approvals") {
            if (typeof renderDisbursementPendingTable === "function") {
                renderDisbursementPendingTable();
            }
            if (typeof renderApprovalTable === "function") {
                renderApprovalTable();
            }
        }
    };

    // Bind event listeners for main cost tab buttons
    document.addEventListener("click", function(e) {
        const btn = e.target.closest(".cost-main-tab-btn");
        if (btn) {
            const tabName = btn.getAttribute("data-main-tab");
            switchCostMainTab(tabName);
        }
    });

    // Bind back button listener
    document.addEventListener("click", function(e) {
        const btn = e.target.closest("#btn-cost-back-to-list");
        if (btn) {
            appState.selectedCostProject = "all";
            sessionStorage.setItem("technical_water_last_cost_project", "all");
            const costSelector = document.getElementById("cost-project-selector");
            if (costSelector) {
                costSelector.value = "all";
            }
            renderCostManagement();
        }
    });

    // 1.2 Cost Management Subtab Switch Listener
    document.addEventListener("click", function(e) {
        const btn = e.target.closest(".cost-tab-btn");
        if (!btn) return;
        
        const tabName = btn.getAttribute("data-cost-tab");
        const container = btn.closest(".view-panel, .subtab-panel");
        if (!container) return;
        
        container.querySelectorAll(".cost-tab-btn").forEach(b => {
            if (b === btn) {
                b.classList.add("active");
                b.style.background = "var(--primary-blue)";
                b.style.color = "#ffffff";
                b.style.borderColor = "var(--primary-blue)";
            } else {
                b.classList.remove("active");
                b.style.background = "#ffffff";
                b.style.color = "var(--navy-dark)";
                b.style.borderColor = "var(--border-color)";
            }
        });

        container.querySelectorAll(".cost-subtab-panel").forEach(panel => {
            if (panel.getAttribute("data-cost-panel") === tabName) {
                panel.style.display = "block";
            } else {
                panel.style.display = "none";
            }
        });
    });

    // 1.3 Daily Report Filter Tabs Listener
    document.addEventListener("click", function(e) {
        const btn = e.target.closest(".dr-filter-btn");
        if (!btn) return;
        
        const filterVal = btn.getAttribute("data-filter");
        appState.activeDailyReportFilter = filterVal;
        
        // Re-render the daily reports to apply the filter
        const project = projectsData[appState.selectedDetailProject];
        if (project) {
            renderSubnavDailyReports(project);
        }
    });

    // 2. Profile Dropdown Toggle
    const profileBtn = document.getElementById("profile-trigger-btn");
    const profileDropdown = document.getElementById("profile-dropdown");
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle("active");
            const notifDropdown = document.getElementById("notification-dropdown");
            if (notifDropdown) notifDropdown.classList.remove("active");
        });
    }

    // 3. Notification Dropdown Toggle
    const notifBtn = document.getElementById("notification-btn");
    const notifDropdown = document.getElementById("notification-dropdown");
    
    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener("click", (e) => {
            if (e.target.closest("#notification-dropdown")) {
                // Clicks inside the dropdown should not toggle the dropdown itself
                return;
            }
            e.stopPropagation();
            notifDropdown.classList.toggle("active");
            if (profileDropdown) profileDropdown.classList.remove("active");
        });
    }

    // Close dropdowns on outside click
    document.addEventListener("click", (e) => {
        const isProfileClick = e.target.closest("#profile-trigger-btn") || e.target.closest("#profile-dropdown");
        if (!isProfileClick && profileDropdown) {
            profileDropdown.classList.remove("active");
        }
        
        const isNotifClick = e.target.closest("#notification-btn") || e.target.closest("#notification-dropdown");
        if (!isNotifClick && notifDropdown) {
            notifDropdown.classList.remove("active");
        }
    });

    // 4. Role Selection Click Listeners
    if (profileDropdown) {
        document.querySelectorAll(".profile-dropdown .role-option").forEach(option => {
            option.addEventListener("click", function(e) {
                e.preventDefault();
                
                if (window.ganttIsDirty) {
                    if (!confirm("⚠️ คุณมีข้อมูลแผนงาน (Plan Work) ที่ยังไม่ได้บันทึก!\nหากสลับบทบาท ข้อมูลล่าสุดที่คุณแก้ไขจะสูญหาย\n\nคุณต้องการสลับบทบาทโดยไม่บันทึกใช่หรือไม่?")) {
                        return;
                    }
                    window.ganttIsDirty = false;
                }

                // Toggle active classes on roles dropdown
                document.querySelectorAll(".profile-dropdown .role-option").forEach(opt => opt.classList.remove("active"));
                this.classList.add("active");
                
                const role = this.getAttribute("data-role");
                // If it's a customer option, set which customer user first
                const customerUser = this.getAttribute("data-customer-user");
                if (role === "customer" && customerUser) {
                    appState.currentCustomerUser = customerUser;
                }
                switchRole(role);
                
                profileDropdown.classList.remove("active");
                closeMobileSidebar();
            });
        });
    }

    // 5. Section 1: Overall Dashboard Year Filter Dropdowns (Comparison)
    const yearFilterA = document.getElementById("year-filter-a");
    const yearFilterB = document.getElementById("year-filter-b");
    if (yearFilterA) {
        yearFilterA.addEventListener("change", function() {
            appState.selectedYearFilterA = this.value;
            renderOverallDashboard();
        });
    }
    if (yearFilterB) {
        yearFilterB.addEventListener("change", function() {
            appState.selectedYearFilterB = this.value;
            renderOverallDashboard();
        });
    }

    // Dashboard KPI Filters (Hospital and Project)
    const kpiFilterHospital = document.getElementById("kpi-filter-hospital");
    const kpiFilterProject = document.getElementById("kpi-filter-project");
    if (kpiFilterHospital) {
        kpiFilterHospital.addEventListener("change", function() {
            populateDashboardKpiProjects();
            updateDashboardProgressAndFinancials();
        });
    }
    if (kpiFilterProject) {
        kpiFilterProject.addEventListener("change", function() {
            updateDashboardProgressAndFinancials();
        });
    }

    // 6. Project Workspace Subnav Year & Project Selectors
    const subnavYearFilter = document.getElementById("subnav-year-filter");
    if (subnavYearFilter) {
        subnavYearFilter.addEventListener("change", function() {
            populateSubnavProjects(this.value);
            updateSelectedDetailProject();
            renderSubnavProjectWorkspace();
        });
    }

    const hospitalSelector = document.getElementById("subnav-hospital-selector");
    if (hospitalSelector) {
        hospitalSelector.addEventListener("change", function() {
            // Auto-reset project selection to "all" when switching hospitals
            appState.selectedDetailProject = "all";
            sessionStorage.setItem("technical_water_last_detail_project", "all");
            const projSel = document.getElementById("subnav-project-selector");
            if (projSel) projSel.value = "all";
            populateSubnavProjects(subnavYearFilter ? subnavYearFilter.value : "all");
            updateSelectedDetailProject();
            renderSubnavProjectWorkspace();
        });
    }

    const subnavSelector = document.getElementById("subnav-project-selector");
    if (subnavSelector) {
        subnavSelector.addEventListener("change", function() {
            updateSelectedDetailProject();
            renderSubnavProjectWorkspace();
        });
    }

    const subnavStatusSelect = document.getElementById("subnav-project-status-selector");
    if (subnavStatusSelect) {
        subnavStatusSelect.addEventListener("change", function() {
            const activeCode = appState.selectedDetailProject;
            if (!activeCode || activeCode === "all" || !projectsData[activeCode]) return;
            const newStatus = this.value;
            projectsData[activeCode].status = newStatus;
            saveToLocalStorage(); // Use the standard function that syncs with Supabase!
            
            showToast(`ปรับสถานะโครงการ ${activeCode} เป็น "${newStatus}" เรียบร้อยแล้ว!`, "success");
            
            const isNewQuoting = (newStatus === "งานที่รอเสนอราคา" || newStatus === "งานที่กำลังเสนอราคา" || newStatus === "กำลังเสนอราคา");
            const isQuotingTab = appState.currentView === "quoting-projects-list";
            
            if (isNewQuoting && !isQuotingTab) {
                appState.selectedDetailProject = activeCode;
                switchView("quoting-projects-list");
            } else if (!isNewQuoting && isQuotingTab) {
                appState.selectedDetailProject = activeCode;
                switchView("projects-list");
            } else {
                renderOverallDashboard();
                renderSubnavProjectWorkspace();
            }
        });
    }

    // Initialize sidebar project search suggestion list (pops up matching projects on the fly)
    const searchInput = document.getElementById("sidebar-project-search");
    const searchResults = document.getElementById("sidebar-search-results");
    if (searchInput && searchResults) {
        const performSearch = () => {
            const query = searchInput.value.trim().toLowerCase();
            searchResults.innerHTML = "";
            
            if (!query) {
                searchResults.style.display = "none";
                return;
            }
            
            // Search all projects globally matching code, name, or customer
            const matches = Object.values(projectsData).filter(p => {
                const code = (p.code || "").toLowerCase();
                const name = (p.name || "").toLowerCase();
                const customer = (p.customer || "").toLowerCase();
                return code.includes(query) || name.includes(query) || customer.includes(query);
            });
            
            if (matches.length === 0) {
                searchResults.innerHTML = `<div style="padding: 10px; font-size: 11px; color: var(--text-muted); text-align: center;">ไม่พบโครงการที่ค้นหา</div>`;
                searchResults.style.display = "block";
                return;
            }
            
            matches.forEach(p => {
                const row = document.createElement("div");
                row.style.cssText = "padding: 8px 12px; font-size: 11px; font-weight: 500; color: var(--navy-dark); cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 2px;";
                row.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; color: var(--primary-color);">${p.code}</span>
                        <span style="font-size: 9px; padding: 2px 6px; border-radius: 99px; background: rgba(16, 185, 129, 0.1); color: #10b981; font-weight: 700;">ปี ${p.year}</span>
                    </div>
                    <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" title="${p.name}">${p.name}</div>
                    <div style="font-size: 9px; color: var(--text-muted);"><i class="fa-solid fa-hospital"></i> ${p.customer}</div>
                `;
                
                row.addEventListener("mouseenter", () => { row.style.background = "#f1f5f9"; });
                row.addEventListener("mouseleave", () => { row.style.background = "transparent"; });
                
                row.addEventListener("click", () => {
                    appState.selectedDetailProject = p.code;
                    sessionStorage.setItem("technical_water_last_detail_project", p.code);
                    
                    // Reset year and hospital filters to "all" to guarantee it appears in the select dropdown
                    const yearFilterEl = document.getElementById("subnav-year-filter");
                    const hospitalFilterEl = document.getElementById("subnav-hospital-selector");
                    if (yearFilterEl) yearFilterEl.value = "all";
                    if (hospitalFilterEl) hospitalFilterEl.value = "all";
                    
                    populateSubnavProjects("all");
                    
                    const subnavSelector = document.getElementById("subnav-project-selector");
                    if (subnavSelector) {
                        subnavSelector.value = p.code;
                    }
                    
                    searchInput.value = p.name;
                    searchResults.style.display = "none";
                    
                    renderSubnavProjectWorkspace();
                });
                
                searchResults.appendChild(row);
            });
            
            searchResults.style.display = "block";
        };
        
        searchInput.addEventListener("input", performSearch);
        searchInput.addEventListener("focus", performSearch);
        
        document.addEventListener("click", function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = "none";
            }
        });
    }

    // =========================================================================
    // PROJECT SELECTION PORTAL LOGIC & HELPERS
    // =========================================================================
    
    window.renderProjectSelectionPortal = function() {
        const portalYearFilter = document.getElementById("portal-year-filter");
        const portalHospitalSelector = document.getElementById("portal-hospital-selector");
        const portalProjectSearch = document.getElementById("portal-project-search");
        const portalProjectsGrid = document.getElementById("portal-projects-grid");
        const portalProjectsCount = document.getElementById("portal-projects-count");

        if (!portalProjectsGrid) return;

        // 1. Sync & populate portal hospital select from subnav-hospital-selector to keep options in sync
        if (portalHospitalSelector) {
            const subnavHosp = document.getElementById("subnav-hospital-selector");
            if (subnavHosp) {
                const currentVal = portalHospitalSelector.value || subnavHosp.value;
                portalHospitalSelector.innerHTML = subnavHosp.innerHTML;
                if ([...portalHospitalSelector.options].some(opt => opt.value === currentVal)) {
                    portalHospitalSelector.value = currentVal;
                } else {
                    portalHospitalSelector.value = "all";
                }
            }
        }

        const portalStatusFilter = document.getElementById("portal-status-filter");
        const selectedStatus = portalStatusFilter ? portalStatusFilter.value : "all";

        const selectedHospital = portalHospitalSelector ? portalHospitalSelector.value : "all";
        const selectedYear = portalYearFilter ? portalYearFilter.value : "all";
        const searchText = portalProjectSearch ? portalProjectSearch.value.trim().toLowerCase() : "";

        const standardHospitals = [
            "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
            "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
            "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4"
        ];

        // 2. Filter projects matching filters
        let projects = Object.values(projectsData).filter(p => {
            let hospitalMatch = false;
            if (selectedHospital === "all") {
                hospitalMatch = true;
            } else if (selectedHospital === "อื่นๆ") {
                hospitalMatch = !standardHospitals.includes(p.customer);
            } else {
                hospitalMatch = p.customer === selectedHospital;
            }
            const yearMatch = selectedYear === "all" || p.year === parseInt(selectedYear);
            const isQuotingTab = appState.currentView === "quoting-projects-list";
            const isQuotingStatus = (p.status === "งานที่กำลังเสนอราคา" || p.status === "กำลังเสนอราคา" || p.status === "งานที่รอเสนอราคา");
            const quotingMatch = isQuotingTab ? isQuotingStatus : !isQuotingStatus;
            
            let statusMatch = true;
            if (selectedStatus !== "all") {
                if (selectedStatus === "งานที่ดำเนินการเสร็จแล้ว") {
                    statusMatch = (p.status === "งานที่ดำเนินการเสร็จแล้ว" || p.status === "เสร็จสิ้น");
                } else if (selectedStatus === "งานเสร็จแล้วรอส่งงาน/อนุมัติ") {
                    statusMatch = (p.status === "เสร็จแล้ว" || p.status === "งานเสร็จแล้วรอส่งงาน" || p.status === "งานเสร็จแล้วรอส่งงาน/อนุมัติ");
                } else if (selectedStatus === "งานที่รอเสนอราคา") {
                    statusMatch = (p.status === "รออนุมัติ" || p.status === "งานรออนุมัติ" || p.status === "งานที่รอเสนอราคา" || p.status === "งานที่กำลังเสนอราคา" || p.status === "กำลังเสนอราคา");
                } else if (selectedStatus === "งานที่กำลังดำเนินการ") {
                    const isFinished = (p.status === "งานที่ดำเนินการเสร็จแล้ว" || p.status === "เสร็จสิ้น");
                    const isComp = (p.status === "เสร็จแล้ว" || p.status === "งานเสร็จแล้วรอส่งงาน" || p.status === "งานเสร็จแล้วรอส่งงาน/อนุมัติ");
                    const isQuot = (p.status === "รออนุมัติ" || p.status === "งานรออนุมัติ" || p.status === "งานที่รอเสนอราคา" || p.status === "งานที่กำลังเสนอราคา" || p.status === "กำลังเสนอราคา");
                    statusMatch = !isFinished && !isComp && !isQuot;
                }
            }
            
            let searchMatch = true;
            if (searchText) {
                const yearTh = (p.year + 543).toString();
                const yearEn = p.year.toString();
                searchMatch = p.code.toLowerCase().includes(searchText) || 
                              p.name.toLowerCase().includes(searchText) || 
                              p.customer.toLowerCase().includes(searchText) ||
                              yearTh.includes(searchText) ||
                              yearEn.includes(searchText);
            }
            return hospitalMatch && yearMatch && quotingMatch && statusMatch && searchMatch;
        });

        // Customer / PE / Tech role permissions restriction
        if (appState.currentRole === "customer" || appState.currentRole === "pe" || appState.currentRole === "technician" || appState.currentRole === "tech") {
            const cUserKey = appState.currentCustomerUser || "user1";
            const perms = appState.userPermissions[cUserKey] || { hospitals: [], projects: [] };
            projects = projects.filter(p => isProjectAllowedForCustomer(p, perms));
        }

        if (portalProjectsCount) portalProjectsCount.textContent = projects.length;

        // Populate portal select project dropdown
        const portalProjDropdown = document.getElementById("portal-project-dropdown");
        if (portalProjDropdown) {
            portalProjDropdown.innerHTML = `<option value="">-- เลือกโครงการ (${projects.length} รายการ) --</option>`;
            projects.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.code;
                opt.textContent = `${p.code} : ${p.name.replace(/ \(\d{4}\)$/, '')} (${p.customer.replace('โรงพยาบาล', 'รพ.')})`;
                portalProjDropdown.appendChild(opt);
            });
        }

        // 3. Render grid of project cards
        portalProjectsGrid.innerHTML = "";
        if (projects.length === 0) {
            portalProjectsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 12px; border: 1px dashed var(--border-color); color: var(--text-muted);">
                    <i class="fa-solid fa-folder-open" style="font-size: 40px; margin-bottom: 12px; color: #cbd5e1;"></i>
                    <p style="margin: 0; font-size: 14px; font-weight: 600;">ไม่พบข้อมูลโครงการตามตัวเลือกหรือคำค้นหาดังกล่าว</p>
                    <p style="margin: 4px 0 0 0; font-size: 12.5px;">กรุณาปรับตัวกรอง หรือสร้างโครงการใหม่ที่มุมขวาบน</p>
                </div>
            `;
            return;
        }

        projects.forEach(p => {
            const card = document.createElement("div");
            card.style.background = "#ffffff";
            card.style.border = "1px solid var(--border-color)";
            card.style.borderRadius = "12px";
            card.style.padding = "20px";
            card.style.cursor = "pointer";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            card.style.gap = "12px";
            card.style.transition = "transform 0.2s, box-shadow 0.2s";
            card.style.boxShadow = "var(--shadow-sm)";

            card.onmouseover = function() {
                this.style.transform = "translateY(-4px)";
                this.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
                this.style.borderColor = "var(--primary-blue)";
            };
            card.onmouseout = function() {
                this.style.transform = "translateY(0)";
                this.style.boxShadow = "var(--shadow-sm)";
                this.style.borderColor = "var(--border-color)";
            };

            // Badge styling based on status
            let badgeBg = "#dcfce7";
            let badgeColor = "#15803d";
            let displayStatus = p.status || "งานที่กำลังดำเนินการ";
            if (displayStatus === "งานเสร็จแล้วรอส่งงาน" || displayStatus === "เสร็จสิ้น" || displayStatus === "งานเสร็จแล้วรอส่งงาน/อนุมัติ") {
                badgeBg = "#e0f2fe";
                badgeColor = "#0369a1";
                displayStatus = "งานเสร็จแล้วรอส่งงาน/อนุมัติ";
            } else if (displayStatus === "งานรออนุมัติ" || displayStatus === "รออนุมัติ" || displayStatus === "งานที่รอเสนอราคา" || displayStatus === "งานที่กำลังเสนอราคา" || displayStatus === "กำลังเสนอราคา") {
                badgeBg = "#fef3c7";
                badgeColor = "#b45309";
                displayStatus = "งานที่รอเสนอราคา";
            }

            const isPM = (appState.currentRole === "pm" || appState.currentRole === "admin" || appState.currentRole === "pe");
            const valFormatted = (Number(p.value) || 0).toLocaleString();
            const infoText = isPM ? `มูลค่าโครงการ: <strong style="color: var(--navy-dark);">${valFormatted} บาท</strong>` : `รหัส PO: <strong>${p.code || '-'}</strong>`;

            // Category detection & visual badge
            let catName = "งานรับเหมาทั่วไป";
            let catColor = "#059669";
            let catBg = "#d1fae5";
            let catIcon = "fa-helmet-safety";

            const pCat = (p.category || "").toLowerCase();
            const pNameStr = (p.name || "").toLowerCase();

            if (pCat === "renovation" || pNameStr.includes("รีโนเวท") || pNameStr.includes("ปรับปรุง") || pNameStr.includes("ตกแต่ง") || pNameStr.includes("กั้นห้อง")) {
                catName = "ปรับปรุง / รีโนเวท";
                catColor = "#c2410c";
                catBg = "#ffedd5";
                catIcon = "fa-hammer";
            } else if (pCat === "building" || pNameStr.includes("ซ่อมแซม") || pNameStr.includes("อาคาร") || pNameStr.includes("โครงสร้าง") || pNameStr.includes("รอยร้าว") || pNameStr.includes("ดาดฟ้า") || pNameStr.includes("ทาสี")) {
                catName = "ซ่อมแซมอาคาร";
                catColor = "#4338ca";
                catBg = "#e0e7ff";
                catIcon = "fa-building";
            } else if (pCat === "plumbing" || pNameStr.includes("ประปา") || pNameStr.includes("สุขาภิบาล") || pNameStr.includes("ท่อ") || pNameStr.includes("ปั๊ม") || pNameStr.includes("บำบัด")) {
                catName = "ประปา & สุขาภิบาล";
                catColor = "#0284c7";
                catBg = "#e0f2fe";
                catIcon = "fa-faucet-drip";
            } else if (p.categoryLabel) {
                catName = p.categoryLabel;
            }

            const siteLocationHTML = (p.site || p.siteLocation || p.location) ? `
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-top: 3px;">
                    <i class="fa-solid fa-location-dot" style="color: #ef4444; width: 14px;"></i>
                    <span>${p.site || p.siteLocation || p.location}</span>
                </div>
            ` : '';

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span style="font-size: 11px; font-weight: 700; background: var(--primary-light); color: var(--navy-dark); padding: 3px 8px; border-radius: 4px; font-family: monospace;">${p.code || ''}</span>
                        <span style="font-size: 10px; font-weight: 700; background: ${catBg}; color: ${catColor}; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fa-solid ${catIcon}"></i> ${catName}
                        </span>
                    </div>
                    <span style="font-size: 10px; font-weight: 700; background: ${badgeBg}; color: ${badgeColor}; padding: 3px 8px; border-radius: 4px; white-space: nowrap;">${displayStatus}</span>
                </div>
                
                <div style="flex-grow: 1;">
                    <h4 style="margin: 0; font-size: 14.5px; font-weight: 700; color: var(--navy-dark); line-height: 1.4; min-height: 40px;">${(p.name || '').replace(/ \(\d{4}\)$/, '')}</h4>
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-muted); margin-top: 8px;">
                        <i class="fa-solid fa-user-tie" style="color: var(--navy-medium); width: 14px;"></i>
                        <span>ลูกค้า: <strong style="color: #1e293b;">${p.customer || '-'}</strong></span>
                    </div>
                    ${siteLocationHTML}
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-top: 3px;">
                        <i class="fa-solid fa-calendar-days" style="color: var(--navy-medium); width: 14px;"></i>
                        <span>ปีโครงการ: ${p.year ? (p.year + 543) + ' (ค.ศ. ' + p.year + ')' : '-'}</span>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 4px;">
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px; display: flex; justify-content: space-between;">
                        <span>${infoText}</span>
                        <span style="font-weight: 700; color: var(--primary-blue);">${p.progress || 0}%</span>
                    </div>
                    
                    <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; display: flex; gap: 1px;">
                        <div style="width: ${p.progress || 0}%; height: 100%; background: #10b981; border-radius: 3px;" title="ผลงานจริง: ${p.progress || 0}%"></div>
                        <div style="width: ${Math.max(0, (p.plannedProgress || 0) - (p.progress || 0))}%; height: 100%; background: #3b82f6; border-radius: 3px;" title="แผนงานสะสม: ${p.plannedProgress || 0}%"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--text-muted); margin-top: 4px;">
                        <span>แผนงานสะสม: ${p.plannedProgress || 0}%</span>
                        <span>งานจริง: ${p.progress || 0}%</span>
                    </div>
                </div>
            `;

            card.addEventListener("click", function() {
                appState.selectedDetailProject = p.code;
                sessionStorage.setItem("technical_water_last_detail_project", p.code);
                
                // Sync to original selector dropdown
                const projSelector = document.getElementById("subnav-project-selector");
                if (projSelector) projSelector.value = p.code;

                renderSubnavProjectWorkspace();
                showToast(`เปิดโครงการ ${p.code} สำเร็จ`, "success");
            });

            portalProjectsGrid.appendChild(card);
        });
    };

    // Portal Filter Events Sync
    const portalYearFilter = document.getElementById("portal-year-filter");
    if (portalYearFilter) {
        portalYearFilter.addEventListener("change", function() {
            const subnavYear = document.getElementById("subnav-year-filter");
            if (subnavYear) {
                subnavYear.value = this.value;
                subnavYear.dispatchEvent(new Event("change"));
            }
            window.renderProjectSelectionPortal();
        });
    }

    const portalHospitalSelector = document.getElementById("portal-hospital-selector");
    if (portalHospitalSelector) {
        portalHospitalSelector.addEventListener("change", function() {
            const subnavHosp = document.getElementById("subnav-hospital-selector");
            if (subnavHosp) {
                subnavHosp.value = this.value;
                subnavHosp.dispatchEvent(new Event("change"));
            }
            window.renderProjectSelectionPortal();
        });
    }

    const portalProjectSearch = document.getElementById("portal-project-search");
    if (portalProjectSearch) {
        portalProjectSearch.addEventListener("input", function() {
            const sidebarSearch = document.getElementById("sidebar-project-search");
            if (sidebarSearch) {
                sidebarSearch.value = this.value;
            }
            window.renderProjectSelectionPortal();
        });
    }

    const portalStatusFilter = document.getElementById("portal-status-filter");
    if (portalStatusFilter) {
        portalStatusFilter.addEventListener("change", function() {
            const val = this.value;
            const isQuotingTab = appState.currentView === "quoting-projects-list";
            
            if (val === "งานที่รอเสนอราคา" && !isQuotingTab) {
                switchView("quoting-projects-list");
                const filter = document.getElementById("portal-status-filter");
                if (filter) filter.value = "งานที่รอเสนอราคา";
            } else if ((val === "งานที่กำลังดำเนินการ" || val === "งานที่ดำเนินการเสร็จแล้ว" || val === "งานเสร็จแล้วรอส่งงาน/อนุมัติ") && isQuotingTab) {
                switchView("projects-list");
                const filter = document.getElementById("portal-status-filter");
                if (filter) filter.value = val;
            } else {
                window.renderProjectSelectionPortal();
            }
        });
    }

    const portalProjectDropdown = document.getElementById("portal-project-dropdown");
    if (portalProjectDropdown) {
        portalProjectDropdown.addEventListener("change", function() {
            const code = this.value;
            if (!code) return;
            
            appState.selectedDetailProject = code;
            sessionStorage.setItem("technical_water_last_detail_project", code);
            
            // Sync to original selector dropdown
            const projSelector = document.getElementById("subnav-project-selector");
            if (projSelector) projSelector.value = code;

            renderSubnavProjectWorkspace();
            showToast(`เปิดโครงการ ${code} สำเร็จ`, "success");
            
            // Reset dropdown selection so it doesn't stay selected
            this.value = "";
        });
    }

    // Toggle portal / cumulative overview buttons
    const btnShowCumulative = document.getElementById("btn-show-cumulative-dashboard");
    if (btnShowCumulative) {
        btnShowCumulative.addEventListener("click", function() {
            appState.showCumulativeOverview = true;
            renderSubnavProjectWorkspace();
        });
    }

    function handleBackToPortal() {
        if (window.ganttIsDirty) {
            if (!confirm("⚠️ คุณมีข้อมูลแผนงาน (Plan Work) ที่ยังไม่ได้บันทึก!\nหากกดย้อนกลับ ข้อมูลล่าสุดที่คุณแก้ไขจะสูญหาย\n\nคุณต้องการย้อนกลับโดยไม่บันทึกใช่หรือไม่?")) {
                return;
            }
            window.ganttIsDirty = false;
        }

        appState.showCumulativeOverview = false;
        appState.selectedDetailProject = "all";
        sessionStorage.setItem("technical_water_last_detail_project", "all");
        
        const projSelector = document.getElementById("subnav-project-selector");
        if (projSelector) projSelector.value = "all";

        renderSubnavProjectWorkspace();
    }

    const btnBackToPortal = document.getElementById("btn-back-to-portal");
    if (btnBackToPortal) {
        btnBackToPortal.addEventListener("click", handleBackToPortal);
    }

    const btnBackToPortalInline = document.getElementById("btn-back-to-portal-inline");
    if (btnBackToPortalInline) {
        btnBackToPortalInline.addEventListener("click", handleBackToPortal);
    }

    // Inline Project actions linkage
    const selectStatusInline = document.getElementById("subnav-project-status-selector-inline");
    if (selectStatusInline) {
        selectStatusInline.addEventListener("change", function() {
            const selectOriginal = document.getElementById("subnav-project-status-selector");
            if (selectOriginal) {
                selectOriginal.value = this.value;
                selectOriginal.dispatchEvent(new Event("change"));
            }
        });
    }

    const btnEditInline = document.getElementById("open-edit-project-btn-inline");
    if (btnEditInline) {
        btnEditInline.addEventListener("click", () => {
            const btnOriginal = document.getElementById("open-edit-project-btn");
            if (btnOriginal) btnOriginal.click();
        });
    }

    const btnShareInline = document.getElementById("copy-share-link-btn-inline");
    if (btnShareInline) {
        btnShareInline.addEventListener("click", () => {
            const btnOriginal = document.getElementById("copy-share-link-btn");
            if (btnOriginal) btnOriginal.click();
        });
    }

    const btnExportInline = document.getElementById("export-project-pdf-btn-inline");
    if (btnExportInline) {
        btnExportInline.addEventListener("click", () => {
            const btnOriginal = document.getElementById("export-project-pdf-btn");
            if (btnOriginal) btnOriginal.click();
        });
    }

    // 7. Section 4: Cost Management Project & Year selectors
    const costDetailYearFilter = document.getElementById("cost-detail-year-filter");
    const costDetailHospitalSelector = document.getElementById("cost-detail-hospital-selector");
    const costSelector = document.getElementById("cost-project-selector");

    if (costDetailYearFilter) {
        costDetailYearFilter.addEventListener("change", function() {
            appState.projectCostCurrentPage = 1;
            populateCostProjects();
            updateSelectedCostProject(costSelector ? costSelector.value : "");
            renderCostManagement();
        });
    }

    if (costDetailHospitalSelector) {
        costDetailHospitalSelector.addEventListener("change", function() {
            appState.projectCostCurrentPage = 1;
            populateCostProjects();
            updateSelectedCostProject(costSelector ? costSelector.value : "");
            renderCostManagement();
        });
    }

    if (costSelector) {
        costSelector.addEventListener("change", function() {
            updateSelectedCostProject(this.value);
            renderCostManagement();
        });
    }

    const costYearFilter = document.getElementById("cost-year-filter");
    if (costYearFilter) {
        costYearFilter.addEventListener("change", function() {
            appState.selectedCostYearFilter = this.value;
            renderCostManagement();
        });
    }

    // 8. Project Workspace Sub-navigation tabs selection
    document.querySelectorAll(".subnav-tab-item").forEach(btn => {
        btn.addEventListener("click", function(e) {
            if (window.ganttIsDirty) {
                if (!confirm("⚠️ คุณมีข้อมูลแผนงาน (Plan Work) ที่ยังไม่ได้บันทึก!\nหากเปลี่ยนหน้า ข้อมูลล่าสุดที่คุณแก้ไขจะสูญหาย\n\nคุณต้องการเปลี่ยนหน้าโดยไม่บันทึกใช่หรือไม่?")) {
                    e.preventDefault();
                    return;
                }
                window.ganttIsDirty = false;
            }
            closeMobileSidebar();
        });
    });

    // 8.5 Scroll-Spy for Stacked View (automatically update active sidebar tab as user scrolls)
    const projectsListView = document.getElementById("projects-list-view");
    if (projectsListView) {
        let isSpyScrolling = false;
        projectsListView.addEventListener("scroll", function() {
            const isCustOrTech = (appState.currentRole === "customer" || appState.currentRole === "technician" || appState.currentRole === "tech");
            if (!isCustOrTech) return;
            
            if (isSpyScrolling) return;
            isSpyScrolling = true;
            
            setTimeout(() => {
                isSpyScrolling = false;
                
                const panels = projectsListView.querySelectorAll(".subtab-panel.active");
                let activeTab = null;
                let minDiff = Infinity;
                const containerRect = projectsListView.getBoundingClientRect();
                
                panels.forEach(panel => {
                    const rect = panel.getBoundingClientRect();
                    // We want the panel closest to the top container edge, but still visible
                    const diff = Math.abs(rect.top - containerRect.top);
                    if (diff < minDiff && rect.bottom > containerRect.top + 50) {
                        minDiff = diff;
                        activeTab = panel.id.replace("subtab-", "").replace("-view", "");
                    }
                });
                
                if (activeTab) {
                    document.querySelectorAll(".subnav-tab-item").forEach(btn => {
                        if (btn.getAttribute("data-subtab") === activeTab) {
                            btn.classList.add("active");
                        } else {
                            btn.classList.remove("active");
                        }
                    });
                    appState.activeProjectTab = activeTab;
                }
            }, 80);
        });
    }

    // 9. Document filter tabs inside subnav Documents view
    const subtabDocFilters = document.getElementById("subtab-doc-tab-filters");
    if (subtabDocFilters) {
        subtabDocFilters.querySelectorAll(".doc-filter-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                subtabDocFilters.querySelectorAll(".doc-filter-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                
                const project = projectsData[appState.selectedDetailProject];
                if (project) {
                    renderSubnavDocumentsTab(project);
                }
            });
        });
    }

    // 10. MODAL: Upload Document
    const uploadModal = document.getElementById("upload-modal");
    const openUploadBtn = document.getElementById("open-upload-modal-btn");
    const closeUploadBtn = document.getElementById("close-upload-modal");
    const cancelUploadBtn = document.getElementById("cancel-upload-btn");
    const uploadForm = document.getElementById("upload-doc-form");

    const openUploadModal = () => {
        document.getElementById("doc-date").value = new Date().toISOString().substring(0, 10);
        document.getElementById("doc-name").value = "";
        const docFileEl = document.getElementById("doc-file");
        if (docFileEl) docFileEl.value = "";
        uploadModal.classList.add("active");
    };
    
    const closeUploadModal = () => {
        uploadModal.classList.remove("active");
    };

    const docFileEl = document.getElementById("doc-file");
    if (docFileEl) {
        docFileEl.addEventListener("change", function() {
            if (this.files && this.files.length > 0) {
                document.getElementById("doc-name").value = this.files[0].name;
            }
        });
    }

    if (openUploadBtn) openUploadBtn.addEventListener("click", openUploadModal);
    const subtabOpenUploadDocBtn = document.getElementById("subtab-open-upload-modal-btn-doc");
    if (subtabOpenUploadDocBtn) subtabOpenUploadDocBtn.addEventListener("click", openUploadModal);

    if (closeUploadBtn) closeUploadBtn.addEventListener("click", closeUploadModal);
    if (cancelUploadBtn) cancelUploadBtn.addEventListener("click", closeUploadModal);

    uploadForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const name = document.getElementById("doc-name").value;
        const type = document.getElementById("doc-type").value;
        const date = document.getElementById("doc-date").value;
        const fileInput = document.getElementById("doc-file");
        
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
        
        const result = await readFileAsBase64(fileInput.files[0]);
        
        // Save file in separate row
        const projectCode = appState.selectedDetailProject;
        const fileKey = `FILE:${projectCode}:DOC:${Date.now()}:${name}`;
        
        showToast("กำลังบันทึกเอกสารขึ้นคลาวด์...", "info");
        const { error: fileErr } = await supabaseClient.from('projects').upsert({
            code: fileKey,
            data: { fileUrl: result.dataUrl },
            updated_at: new Date().toISOString()
        });
        if (fileErr) {
            showToast(`อัปโหลดเอกสารล้มเหลว: ${fileErr.message}`, "error");
            return;
        }
        const fileUrl = fileKey; // Store reference key!
        
        const project = projectsData[appState.selectedDetailProject];
        if (project) {
            if (!project.documents) project.documents = [];
            project.documents.unshift({ name, type, uploadedAt: date, fileUrl });
            
            // Save and sync immediately
            saveToLocalStorage();
            
            showToast(`อัปโหลดเอกสาร ${name} เข้าสู่โครงการเรียบร้อย!`, "success");
            closeUploadModal();
            renderSubnavProjectWorkspace();
        }
    });

    // 11. MODAL: Add/Edit Expense
    let editingExpenseIndex = -1;
    let isDrawdownRequest = false;
    const expenseModal = document.getElementById("expense-modal");
    const openExpenseBtn = document.getElementById("open-expense-modal-btn");
    const closeExpenseBtn = document.getElementById("close-expense-modal");
    const cancelExpenseBtn = document.getElementById("cancel-expense-btn");
    const expenseForm = document.getElementById("add-expense-form");

    window.openExpenseModal = (editIdx = -1) => {
        editingExpenseIndex = editIdx;
        const modalTitle = expenseModal.querySelector(".modal-title");
        const submitBtn = expenseForm.querySelector("button[type='submit']");
        const fileEl = document.getElementById("exp-file");
        if (fileEl) fileEl.value = "";

        const project = projectsData[appState.selectedCostProject];
        if (!project) {
            showToast("ไม่พบข้อมูลโครงการ", "error");
            return;
        }

        if (editIdx === -1) {
            if (isDrawdownRequest) {
                if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-paper-plane"></i> ขอเบิกงบโครงการใหม่`;
                if (submitBtn) submitBtn.textContent = "ส่งคำขอเบิกงบ";
            } else {
                if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-receipt"></i> บันทึกค่าใช้จ่ายใหม่`;
                if (submitBtn) submitBtn.textContent = "บันทึกรายการ";
            }
            document.getElementById("exp-date").value = new Date().toISOString().substring(0, 10);
            document.getElementById("exp-title").value = "";
            document.getElementById("exp-amount").value = "";
            document.getElementById("exp-type").value = "ค่าแรง";
        } else {
            const exp = project.expenses[editIdx];
            if (!exp) return;

            isDrawdownRequest = (exp.status === "รออนุมัติ" || exp.status === "อนุมัติแล้ว" || exp.status === "ปฏิเสธ");
            
            if (isDrawdownRequest) {
                if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไขข้อมูลคำขอเบิกงบ`;
                if (submitBtn) submitBtn.textContent = "บันทึกการแก้ไขคำขอ";
            } else {
                if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไขข้อมูลรายจ่าย`;
                if (submitBtn) submitBtn.textContent = "บันทึกการแก้ไข";
            }
            
            document.getElementById("exp-date").value = exp.date;
            document.getElementById("exp-title").value = exp.title || "";
            document.getElementById("exp-amount").value = exp.amount || "";
            document.getElementById("exp-type").value = exp.type || "ค่าแรง";
        }
        expenseModal.classList.add("active");
    };

    const closeExpenseModal = () => {
        expenseModal.classList.remove("active");
    };

    if (openExpenseBtn) openExpenseBtn.addEventListener("click", () => {
        isDrawdownRequest = false;
        window.openExpenseModal(-1);
    });
    const subtabOpenExpenseBtn = document.getElementById("subtab-open-expense-modal-btn");
    if (subtabOpenExpenseBtn) {
        subtabOpenExpenseBtn.addEventListener("click", () => {
            updateSelectedCostProject(appState.selectedDetailProject);
            isDrawdownRequest = false;
            window.openExpenseModal(-1);
        });
    }
    const subtabOpenDrawdownBtn = document.getElementById("subtab-open-drawdown-modal-btn");
    if (subtabOpenDrawdownBtn) {
        subtabOpenDrawdownBtn.addEventListener("click", () => {
            updateSelectedCostProject(appState.selectedDetailProject);
            isDrawdownRequest = true;
            window.openExpenseModal(-1);
        });
    }
    if (closeExpenseBtn) closeExpenseBtn.addEventListener("click", closeExpenseModal);
    if (cancelExpenseBtn) cancelExpenseBtn.addEventListener("click", closeExpenseModal);

    expenseForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const title = document.getElementById("exp-title").value;
        const type = document.getElementById("exp-type").value;
        const amount = parseFloat(document.getElementById("exp-amount").value);
        const date = document.getElementById("exp-date").value;
        const fileInput = document.getElementById("exp-file");
        
        const project = projectsData[appState.selectedCostProject];
        if (!project) {
            showToast("ไม่พบข้อมูลโครงการ", "error");
            return;
        }
        
        let file = "";
        let fileUrl = "";
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            const uploadedFile = fileInput.files[0];
            const result = await readFileAsBase64(uploadedFile);
            file = result.name;
            
            // Create a unique FILE key for this expense receipt
            const fileKey = `FILE:${project.code || appState.selectedCostProject}:EXPENSE:${Date.now()}:${file}`;
            
            showToast("กำลังบันทึกไฟล์ใบเสร็จขึ้นคลาวด์...", "info");
            try {
                const { error: fileErr } = await supabaseClient.from('projects').upsert({
                    code: fileKey,
                    data: { fileUrl: result.dataUrl },
                    updated_at: new Date().toISOString()
                });
                if (fileErr) throw fileErr;
                
                // Cache in memory only to preserve localStorage quota
                window.fileCache = window.fileCache || {};
                window.fileCache[fileKey] = result.dataUrl;
                
                fileUrl = fileKey;
            } catch (err) {
                console.error("Upload receipt error:", err);
                showToast(`อัปโหลดใบเสร็จล้มเหลว: ${err.message || err}`, "error");
                return;
            }
        }
        
        if (project) {
            if (!project.expenses) project.expenses = [];
            
            if (editingExpenseIndex >= 0) {
                // Edit existing expense
                const oldExp = project.expenses[editingExpenseIndex];
                if (!file && oldExp) {
                    file = oldExp.file || "";
                    fileUrl = oldExp.fileUrl || "";
                }
                const status = oldExp.status || (isDrawdownRequest ? "รออนุมัติ" : "จ่ายตรง");
                project.expenses[editingExpenseIndex] = { date, title, type, amount, file, fileUrl, status, rejectReason: oldExp.rejectReason || "" };
                showToast(`แก้ไขรายการ: ${title} สำเร็จ!`, "success");
            } else {
                // Add new expense
                const status = isDrawdownRequest ? "รออนุมัติ" : "จ่ายตรง";
                project.expenses.unshift({ date, title, type, amount, file, fileUrl, status, rejectReason: "" });
                if (isDrawdownRequest) {
                    showToast(`ส่งคำขอเบิกงบ: ${title} จำนวน ${formatNumber(amount)} บาท เรียบร้อยแล้ว!`, "success");
                } else {
                    showToast(`บันทึกรายการจ่าย: ${title} จำนวน ${formatNumber(amount)} บาท สำเร็จ!`, "success");
                }
            }
            
            recalculateCostStructure(project);
            saveToLocalStorage();
            closeExpenseModal();
            
            renderSubnavProjectWorkspace();
            renderCostManagement();
            renderOverallDashboard();
            if (typeof updateBellBadge === "function") {
                updateBellBadge();
            }
        }
    });

    // 12. MODAL: Upload Media Photo
    const mediaModal = document.getElementById("media-upload-modal");
    const closeMediaBtn = document.getElementById("close-media-modal");
    const cancelMediaBtn = document.getElementById("btn-cancel-media");
    const mediaForm = document.getElementById("media-upload-form");

    const openMediaModal = () => {
        const mediaFileEl = document.getElementById("media-file");
        if (mediaFileEl) mediaFileEl.value = "";
        mediaModal.classList.add("active");
    };

    const closeMediaModal = () => {
        mediaModal.classList.remove("active");
    };

    // Event delegation for the dynamic open button
    document.addEventListener("click", function(e) {
        if (e.target && (e.target.id === "subnav-open-media-modal-btn" || e.target.closest("#subnav-open-media-modal-btn"))) {
            openMediaModal();
        }
    });

    if (closeMediaBtn) closeMediaBtn.addEventListener("click", closeMediaModal);
    if (cancelMediaBtn) cancelMediaBtn.addEventListener("click", closeMediaModal);

    if (mediaForm) {
        mediaForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById("media-file");
            
            const project = projectsData[appState.selectedDetailProject];
            if (!project) {
                showToast("ไม่พบข้อมูลโครงการ", "error");
                return;
            }
            
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                const files = fileInput.files;
                const totalFiles = files.length;
                
                // Create blocking progress overlay
                const uploadOverlay = document.createElement("div");
                uploadOverlay.id = "upload-progress-overlay";
                uploadOverlay.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 99999; color: #fff; font-family: 'Prompt', sans-serif; backdrop-filter: blur(4px);";
                uploadOverlay.innerHTML = `
                    <div style="background: #ffffff; color: var(--navy-dark); padding: 32px; border-radius: var(--radius-lg); width: 90%; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;">
                        <div id="upload-status-icon" style="position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                            <i class="fa-solid fa-spinner fa-spin" style="font-size: 48px; color: var(--primary-blue);"></i>
                        </div>
                        <h3 id="upload-status-title" style="margin: 0; font-size: 18px; font-weight: 700;">กำลังอัปโหลดรูปภาพ...</h3>
                        <p id="upload-status-desc" style="margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.5;">กำลังเริ่มอัปโหลดรูปภาพ กรุณาอย่าปิดหน้าต่างนี้</p>
                        
                        <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 8px; position: relative;">
                            <div id="upload-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); transition: width 0.2s ease;"></div>
                        </div>
                        <div id="upload-progress-percent" style="font-size: 12.5px; font-weight: 700; color: var(--primary-blue);">0%</div>
                        
                        <button id="upload-success-btn" class="btn btn-primary" style="display: none; width: 100%; justify-content: center; padding: 10px; font-size: 13px; font-weight: 700; border-radius: 8px; margin-top: 8px; cursor: pointer;">ตกลง</button>
                    </div>
                `;
                document.body.appendChild(uploadOverlay);
                
                if (!project.media) project.media = [];
                
                const now = new Date();
                const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
                
                let successCount = 0;
                let failCount = 0;
                
                const progressBar = document.getElementById("upload-progress-bar");
                const progressPercent = document.getElementById("upload-progress-percent");
                const statusDesc = document.getElementById("upload-status-desc");
                
                for (let i = 0; i < totalFiles; i++) {
                    const fileObj = files[i];
                    
                    if (statusDesc) {
                        statusDesc.textContent = `กำลังอัปโหลด รูปที่ ${i + 1} จากทั้งหมด ${totalFiles} รูป...`;
                    }
                    
                    try {
                        const result = await readFileAsBase64(fileObj);
                        
                        const projectCode = appState.selectedDetailProject;
                        const fileKey = `FILE:${projectCode}:MEDIA:${Date.now()}_${i}:${fileObj.name}`;
                        
                        const { error: fileErr } = await supabaseClient.from('projects').upsert({
                            code: fileKey,
                            data: { fileUrl: result.dataUrl },
                            updated_at: new Date().toISOString()
                        });
                        
                        if (fileErr) {
                            console.error("Upload error for file:", fileObj.name, fileErr);
                            failCount++;
                        } else {
                            project.media.unshift({
                                title: "",
                                date: formattedDate,
                                img: fileKey
                            });
                            successCount++;
                        }
                    } catch (err) {
                        console.error("Processing error for file:", fileObj.name, err);
                        failCount++;
                    }
                    
                    // Update progress
                    const percent = Math.round(((i + 1) / totalFiles) * 100);
                    if (progressBar) progressBar.style.width = `${percent}%`;
                    if (progressPercent) progressPercent.textContent = `${percent}%`;
                }
                
                // Save and sync immediately
                saveToLocalStorage();
                
                // Show completion status
                const statusIcon = document.getElementById("upload-status-icon");
                const statusTitle = document.getElementById("upload-status-title");
                const successBtn = document.getElementById("upload-success-btn");
                
                if (progressBar) progressBar.style.width = "100%";
                if (progressPercent) progressPercent.textContent = "100%";
                
                if (successCount > 0) {
                    if (statusIcon) {
                        statusIcon.innerHTML = `<i class="fa-solid fa-circle-check" style="font-size: 56px; color: #10b981; animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);"></i>`;
                    }
                    if (statusTitle) {
                        statusTitle.textContent = "อัปโหลดเสร็จเรียบร้อย!";
                        statusTitle.style.color = "#10b981";
                    }
                    if (statusDesc) {
                        statusDesc.innerHTML = `อัปโหลดรูปภาพสำเร็จ <strong style="font-size: 15px; color: var(--navy-dark);">${successCount} รูป</strong>${failCount > 0 ? `<br><span style="color: var(--color-delayed); font-size: 12px;">ล้มเหลว ${failCount} รูป</span>` : ''}`;
                    }
                } else {
                    if (statusIcon) {
                        statusIcon.innerHTML = `<i class="fa-solid fa-circle-xmark" style="font-size: 56px; color: #ef4444;"></i>`;
                    }
                    if (statusTitle) {
                        statusTitle.textContent = "อัปโหลดล้มเหลว";
                        statusTitle.style.color = "#ef4444";
                    }
                    if (statusDesc) {
                        statusDesc.textContent = "ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง";
                    }
                }
                
                if (successBtn) {
                    successBtn.style.display = "flex";
                    successBtn.addEventListener("click", () => {
                        uploadOverlay.remove();
                        closeMediaModal();
                        renderSubnavProjectWorkspace();
                    });
                }
            } else {
                showToast("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป", "warning");
            }
        });
    }

    // 13. MODAL: Write / Upload Daily Report
    let editingReportIndex = -1;
    let currentPhotosList = []; // Array of { type: 'cloud' | 'base64', val: string, fileObj?: File }

    const dailyReportModal = document.getElementById("daily-report-modal");
    const closeDailyReportBtn = document.getElementById("close-daily-report-modal");
    const cancelDailyReportBtn = document.getElementById("btn-cancel-report");
    const dailyReportForm = document.getElementById("daily-report-form");
    
    // HTML5 signature drawing canvas helper
    function initSignaturePad(canvas) {
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        let drawing = false;
        let lastPos = { x: 0, y: 0 };
        
        function getMousePos(canvasDom, e) {
            const rect = canvasDom.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            // Scaled position
            const scaleX = canvasDom.width / rect.width;
            const scaleY = canvasDom.height / rect.height;
            
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }
        
        function startDrawing(e) {
            e.preventDefault();
            drawing = true;
            lastPos = getMousePos(canvas, e);
        }
        
        function draw(e) {
            if (!drawing) return;
            e.preventDefault();
            const pos = getMousePos(canvas, e);
            
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            
            lastPos = pos;
        }
        
        function stopDrawing(e) {
            drawing = false;
        }
        
        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", stopDrawing);
        canvas.addEventListener("mouseleave", stopDrawing);
        
        canvas.addEventListener("touchstart", startDrawing, { passive: false });
        canvas.addEventListener("touchmove", draw, { passive: false });
        canvas.addEventListener("touchend", stopDrawing, { passive: false });
        
        canvas.clear = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        
        canvas.isEmpty = function() {
            const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
            return !buffer.some(color => color !== 0);
        };
    }
    
    function addSignerRow(existingSig = null) {
        if (existingSig && (existingSig instanceof Event || typeof existingSig.name !== 'string')) {
            existingSig = null;
        }

        const container = document.getElementById("report-signers-container");
        if (!container) return;
        
        const index = container.children.length;
        if (index >= 4) {
            showToast("เพิ่มลายเซ็นได้สูงสุด 4 คน", "warning");
            return;
        }
        
        const box = document.createElement("div");
        box.className = "signer-box";
        box.style.cssText = "padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: #f8fafc; position: relative; margin-bottom: 10px;";
        box.innerHTML = `
            <button type="button" class="btn-remove-signer" style="position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 16px; color: #ef4444; cursor: pointer; font-weight: bold; z-index: 10;">&times;</button>
            <div style="font-size: 11.5px; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;">ผู้ลงลายเซ็นคนที่ ${index + 1}</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div>
                    <label class="form-label" style="font-size: 10px; font-weight: 600;">ชื่อ-นามสกุล <span class="required">*</span></label>
                    <input type="text" class="form-control signer-name" list="signer-names-datalist" placeholder="เช่น นายสมชาย ใจดี" required style="font-size: 11px; padding: 4px 8px; height: auto;" autocomplete="off">
                </div>
                <div>
                    <label class="form-label" style="font-size: 10px; font-weight: 600;">ตำแหน่ง/บทบาท <span class="required">*</span></label>
                    <select class="form-control signer-role signer-role-select" required style="font-size: 11px; padding: 4px 8px; height: 28px; line-height: 1.2; font-family: 'Prompt';">
                        <!-- Populated dynamically -->
                    </select>
                </div>
            </div>
            
            <div class="sig-draw-area">
                <label class="form-label" style="font-size: 10px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span>วาดลายเซ็นลงบนพื้นที่ด้านล่าง <span class="required">*</span></span>
                    <button type="button" class="btn-clear-sig" style="background: none; border: none; font-size: 10px; color: #3b82f6; cursor: pointer; text-decoration: underline; padding: 0;">ล้างลายเซ็น</button>
                </label>
                <canvas class="signature-canvas" width="400" height="120" style="border: 1px dashed var(--border-color); border-radius: 4px; background: #ffffff; cursor: crosshair; display: block; touch-action: none; width: 100%; height: 120px;"></canvas>
            </div>

            <div class="sig-preview-area" style="display: none; align-items: center; gap: 12px; background: #ffffff; border: 1px solid var(--border-color); padding: 8px; border-radius: 4px; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 10px; font-weight: 600; color: var(--text-muted);">ลายเซ็นเดิม:</span>
                    <img class="existing-sig-img" src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 120 40'%2F%3E" style="height: 40px; max-width: 150px; object-fit: contain; background: #fff; border: 1px solid #f1f5f9; padding: 2px;">
                </div>
                <button type="button" class="btn-redraw-sig btn btn-xs btn-outline-blue" style="font-size: 10px; padding: 3px 8px; cursor: pointer;">เขียนใหม่</button>
            </div>
        `;
        
        container.appendChild(box);

        // Initialize autocomplete role dropdown
        const roleSelect = box.querySelector(".signer-role-select");
        const initialRole = existingSig ? (existingSig.role || "") : "";
        if (initialRole && !appState.signerRolesHistory.includes(initialRole)) {
            appState.signerRolesHistory.push(initialRole);
        }
        window.initSignerRoleDropdown(roleSelect, initialRole);
        
        const canvas = box.querySelector(".signature-canvas");
        const drawArea = box.querySelector(".sig-draw-area");
        const previewArea = box.querySelector(".sig-preview-area");
        const sigImg = box.querySelector(".existing-sig-img");
        const redrawBtn = box.querySelector(".btn-redraw-sig");
        
        initSignaturePad(canvas);
        
        box.querySelector(".btn-clear-sig").addEventListener("click", () => canvas.clear());
        
        box.querySelector(".btn-remove-signer").addEventListener("click", () => {
            box.remove();
            // Re-index titles
            container.querySelectorAll(".signer-box").forEach((el, idx) => {
                el.querySelector("div").textContent = `ผู้ลงลายเซ็นคนที่ ${idx + 1}`;
            });
        });

        if (existingSig) {
            box.querySelector(".signer-name").value = existingSig.name || "";
            
            drawArea.style.display = "none";
            previewArea.style.display = "flex";
            box.setAttribute("data-existing-sig", existingSig.image);
            box.setAttribute("data-needs-redraw", "false");
            
            if (existingSig.image && existingSig.image.startsWith("FILE:")) {
                supabaseClient.from('projects').select('data').eq('code', existingSig.image).single()
                    .then(({ data }) => {
                        if (data && data.data && data.data.fileUrl) {
                            sigImg.src = data.data.fileUrl;
                        }
                    })
                    .catch(err => console.error("Failed to load edit signature:", err));
            } else if (existingSig.image) {
                sigImg.src = existingSig.image;
            }
            
            redrawBtn.addEventListener("click", () => {
                drawArea.style.display = "block";
                previewArea.style.display = "none";
                box.setAttribute("data-needs-redraw", "true");
            });
        } else {
            box.setAttribute("data-needs-redraw", "true");
        }
    }

    function renderReportPhotosPreview() {
        const previewContainer = document.getElementById("report-photos-preview");
        if (!previewContainer) return;
        previewContainer.innerHTML = "";
        
        currentPhotosList.forEach((photo, index) => {
            const itemBox = document.createElement("div");
            itemBox.style.cssText = "position: relative; width: 70px; height: 70px; border-radius: 4px; border: 1px solid var(--border-color); overflow: hidden; background: #fafafa;";
            
            const img = document.createElement("img");
            img.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
            
            if (photo.type === "cloud") {
                img.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 100 100'%2F%3E";
                if (photo.val.startsWith("FILE:")) {
                    supabaseClient.from('projects').select('data').eq('code', photo.val).single()
                        .then(({ data }) => {
                            if (data && data.data && data.data.fileUrl) {
                                img.src = data.data.fileUrl;
                            }
                        })
                        .catch(err => console.error("Failed to load thumbnail:", err));
                } else {
                    img.src = photo.val;
                }
            } else {
                img.src = photo.val;
            }
            
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.innerHTML = "&times;";
            delBtn.style.cssText = "position: absolute; top: 2px; right: 2px; background: rgba(239, 68, 68, 0.85); color: white; border: none; border-radius: 50%; width: 16px; height: 16px; font-size: 11px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: bold; line-height: 1; z-index: 10;";
            delBtn.addEventListener("click", () => {
                currentPhotosList.splice(index, 1);
                renderReportPhotosPreview();
            });
            
            itemBox.appendChild(img);
            itemBox.appendChild(delBtn);
            previewContainer.appendChild(itemBox);
        });
    }

    window.openDailyReportModal = (editIdx = -1) => {
        const project = projectsData[appState.selectedDetailProject];
        if (!project) {
            showToast("ไม่พบข้อมูลโครงการ", "error");
            return;
        }

        editingReportIndex = editIdx;
        currentPhotosList = [];
        
        const modalTitle = dailyReportModal.querySelector(".modal-title");
        const submitBtn = dailyReportForm.querySelector("button[type='submit']");
        
        if (editIdx === -1) {
            if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-file-signature"></i> เขียน / อัปโหลดรายงานรายวัน`;
            if (submitBtn) submitBtn.textContent = "ส่งรายงาน";
            document.getElementById("report-date").value = new Date().toISOString().substring(0, 10);
            document.getElementById("report-desc").value = "";
        } else {
            if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไขรายงานการปฏิบัติงานรายวัน`;
            if (submitBtn) submitBtn.textContent = "บันทึกการแก้ไข";
            
            const rep = project.dailyReports[editIdx];
            if (!rep) return;
            
            // Format date back to yyyy-mm-dd
            if (rep.date) {
                const parts = rep.date.split("/");
                if (parts.length === 3) {
                    document.getElementById("report-date").value = `${parts[2]}-${parts[1]}-${parts[0]}`;
                } else {
                    document.getElementById("report-date").value = new Date().toISOString().substring(0, 10);
                }
            } else {
                document.getElementById("report-date").value = new Date().toISOString().substring(0, 10);
            }
            
            document.getElementById("report-desc").value = rep.desc || "";
            
            // Pre-populate photos
            if (rep.images && rep.images.length > 0) {
                currentPhotosList = rep.images.map(imgKey => ({ type: "cloud", val: imgKey }));
            }
        }
        
        const reportFileEl = document.getElementById("report-file");
        if (reportFileEl) reportFileEl.value = "";
        
        const reportPhotosEl = document.getElementById("report-photos");
        if (reportPhotosEl) reportPhotosEl.value = "";
        
        renderReportPhotosPreview();
        
        const signersContainer = document.getElementById("report-signers-container");
        if (signersContainer) {
            signersContainer.innerHTML = "";
            if (editIdx >= 0) {
                const project = projectsData[appState.selectedDetailProject];
                const rep = project.dailyReports[editIdx];
                if (rep.signatures && rep.signatures.length > 0) {
                    rep.signatures.forEach(sig => {
                        addSignerRow(sig);
                    });
                }
            }
        }
        
        dailyReportModal.classList.add("active");
    };

    const closeDailyReportModal = () => {
        dailyReportModal.classList.remove("active");
    };

    // Photo input change listener for preview
    const photoInputEl = document.getElementById("report-photos");
    if (photoInputEl) {
        photoInputEl.addEventListener("change", async function() {
            const files = Array.from(photoInputEl.files);
            
            if (currentPhotosList.length + files.length > 20) {
                showToast("สามารถแนบรูปภาพได้สูงสุด 20 ภาพ", "warning");
                photoInputEl.value = "";
                return;
            }
            
            for (const file of files) {
                const result = await readFileAsBase64(file);
                currentPhotosList.push({
                    type: "base64",
                    val: result.dataUrl,
                    fileObj: file
                });
            }
            
            photoInputEl.value = "";
            renderReportPhotosPreview();
        });
    }

    // Signers button hook
    const addSignerBtn = document.getElementById("btn-add-signer");
    if (addSignerBtn) {
        addSignerBtn.addEventListener("click", addSignerRow);
    }

    // Event delegation for opening the modal
    document.addEventListener("click", function(e) {
        if (e.target && (e.target.id === "subnav-open-daily-report-modal-btn" || e.target.closest("#subnav-open-daily-report-modal-btn"))) {
            if (window.openDailyReportModal) window.openDailyReportModal();
        }
    });

    if (closeDailyReportBtn) closeDailyReportBtn.addEventListener("click", closeDailyReportModal);
    if (cancelDailyReportBtn) cancelDailyReportBtn.addEventListener("click", closeDailyReportModal);

    if (dailyReportForm) {
        dailyReportForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const dateVal = document.getElementById("report-date").value;
            const descVal = document.getElementById("report-desc").value;
            const fileInput = document.getElementById("report-file");
            
            // Validate signers signatures are drawn
            const signerBoxes = document.querySelectorAll("#report-signers-container .signer-box");
            const signaturesRefs = [];
            
            for (let i = 0; i < signerBoxes.length; i++) {
                const box = signerBoxes[i];
                const canvas = box.querySelector(".signature-canvas");
                const name = box.querySelector(".signer-name").value.trim();
                const role = box.querySelector(".signer-role").value.trim();
                const needsRedraw = box.getAttribute("data-needs-redraw") === "true";
                const existingSigKey = box.getAttribute("data-existing-sig");
                
                if (needsRedraw) {
                    if (!canvas || canvas.isEmpty()) {
                        showToast(`กรุณาวาดลายเซ็นสำหรับผู้ลงนามคนที่ ${i + 1} (${name || 'ไม่ระบุชื่อ'})`, "warning");
                        return;
                    }
                    
                    // Convert signature pad to Data URL
                    const sigDataUrl = canvas.toDataURL("image/png");
                    
                    // Save signature image in Supabase as a separate row
                    const projectCode = appState.selectedDetailProject;
                    const sigKey = `FILE:${projectCode}:DAILY_SIG:${dateVal}:${Date.now()}:${i}:${name}`;
                    
                    showToast(`กำลังบันทึกลายเซ็นผู้รับรองคนที่ ${i + 1}...`, "info");
                    const { error: sigErr } = await supabaseClient.from('projects').upsert({
                        code: sigKey,
                        data: { fileUrl: sigDataUrl },
                        updated_at: new Date().toISOString()
                    });
                    if (sigErr) {
                        showToast(`บันทึกลายเซ็นล้มเหลว: ${sigErr.message}`, "error");
                        return;
                    }
                    
                    signaturesRefs.push({
                        name: name,
                        role: role,
                        image: sigKey // Reference key
                    });
                } else {
                    // Keep existing signature reference key
                    signaturesRefs.push({
                        name: name,
                        role: role,
                        image: existingSigKey
                    });
                }
            }
            
            const parts = dateVal.split("-");
            const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            
            // Save attached PDF if selected
            let pdfName = "";
            let fileUrl = "";
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                const result = await readFileAsBase64(fileInput.files[0]);
                pdfName = result.name;
                
                const projectCode = appState.selectedDetailProject;
                const fileKey = `FILE:${projectCode}:DAILY:${dateVal}:${pdfName}`;
                
                showToast("กำลังบันทึกไฟล์รายงานขึ้นคลาวด์...", "info");
                const { error: fileErr } = await supabaseClient.from('projects').upsert({
                    code: fileKey,
                    data: { fileUrl: result.dataUrl },
                    updated_at: new Date().toISOString()
                });
                if (fileErr) {
                    showToast(`อัปโหลดไฟล์ล้มเหลว: ${fileErr.message}`, "error");
                    return;
                }
                fileUrl = fileKey;
            } else {
                pdfName = `DailyReport_${dateVal}.pdf`;
            }
            
            // Save attached Photos
            const imagesRefs = [];
            for (let i = 0; i < currentPhotosList.length; i++) {
                const photo = currentPhotosList[i];
                if (photo.type === "cloud") {
                    imagesRefs.push(photo.val);
                } else if (photo.type === "base64") {
                    const projectCode = appState.selectedDetailProject;
                    const fileKey = `FILE:${projectCode}:DAILY_PHOTO:${dateVal}:${Date.now()}:${i}:${photo.fileObj ? photo.fileObj.name : 'photo.png'}`;
                    
                    showToast(`กำลังบันทึกรูปภาพที่ ${i + 1} ขึ้นคลาวด์...`, "info");
                    const { error: photoErr } = await supabaseClient.from('projects').upsert({
                        code: fileKey,
                        data: { fileUrl: photo.val },
                        updated_at: new Date().toISOString()
                    });
                    if (photoErr) {
                        showToast(`อัปโหลดรูปภาพล้มเหลว: ${photoErr.message}`, "error");
                        return;
                    }
                    imagesRefs.push(fileKey);
                }
            }
            
            const project = projectsData[appState.selectedDetailProject];
            if (project) {
                if (!project.dailyReports) project.dailyReports = [];
                
                const reportPayload = {
                    date: formattedDate,
                    desc: descVal,
                    file: fileInput && fileInput.files && fileInput.files.length > 0 ? pdfName : (editingReportIndex >= 0 ? project.dailyReports[editingReportIndex].file : ""),
                    fileUrl: fileInput && fileInput.files && fileInput.files.length > 0 ? fileUrl : (editingReportIndex >= 0 ? project.dailyReports[editingReportIndex].fileUrl : ""),
                    images: imagesRefs,
                    signatures: signaturesRefs
                };
                
                if (editingReportIndex >= 0) {
                    project.dailyReports[editingReportIndex] = reportPayload;
                    showToast(`แก้ไขรายงานประจำวันที่ ${formattedDate} สำเร็จ!`, "success");
                } else {
                    project.dailyReports.unshift(reportPayload);
                    showToast(`ส่งรายงานการปฏิบัติงานรายวันประจำวันที่ ${formattedDate} สำเร็จ!`, "success");
                }
                
                saveToLocalStorage();

                // Collect signer names to history
                let historyUpdated = false;
                signaturesRefs.forEach(sig => {
                    if (sig.name && sig.name.trim()) {
                        const nameTrimmed = sig.name.trim();
                        if (!appState.signerNamesHistory.includes(nameTrimmed)) {
                            appState.signerNamesHistory.push(nameTrimmed);
                            historyUpdated = true;
                        }
                    }
                });
                
                if (historyUpdated) {
                    localStorage.setItem("technical_water_signer_names_history", JSON.stringify(appState.signerNamesHistory));
                    if (typeof window.updateSignerNamesDatalist === "function") window.updateSignerNamesDatalist();
                    
                    if (typeof supabaseClient !== "undefined") {
                        supabaseClient.from('projects').upsert({
                            code: 'FILE:SIGNER_NAMES_HISTORY',
                            data: { history: appState.signerNamesHistory }
                        }).catch(err => console.error("Failed to sync signer names history to Supabase:", err));
                    }
                }

                closeDailyReportModal();
                renderSubnavProjectWorkspace();
            }
        });
    }

    // 14. MODAL: Create Customer User & Password
    const createCustomerModal = document.getElementById("create-customer-modal");
    const closeCreateCustomerBtn = document.getElementById("close-create-customer-modal");
    const cancelCreateCustomerBtn = document.getElementById("cancel-create-customer-btn");
    const createCustomerForm = document.getElementById("create-customer-form");
    const btnGenUsername = document.getElementById("btn-auto-gen-username");
    const btnGenPassword = document.getElementById("btn-auto-gen-password");

    window.generateRandomUsername = function() {
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `cust_user_${rand}`;
    };

    window.generateRandomPassword = function() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@!";
        let pass = "";
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    };

    window.openCreateCustomerModal = function() {
        const modal = document.getElementById("create-customer-modal");
        const nameEl = document.getElementById("new-cust-name");
        const uEl = document.getElementById("new-cust-username");
        const pEl = document.getElementById("new-cust-password");
        if (nameEl) nameEl.value = "";
        if (uEl) uEl.value = window.generateRandomUsername();
        if (pEl) pEl.value = window.generateRandomPassword();
        if (modal) modal.classList.add("active");
    };

    window.closeCreateCustomerModal = function() {
        const modal = document.getElementById("create-customer-modal");
        if (modal) modal.classList.remove("active");
    };

    const openCreateCustomerBtn = document.getElementById("btn-open-create-customer-modal");
    if (openCreateCustomerBtn) {
        openCreateCustomerBtn.addEventListener("click", window.openCreateCustomerModal);
    }

    if (closeCreateCustomerBtn) closeCreateCustomerBtn.onclick = window.closeCreateCustomerModal;
    if (cancelCreateCustomerBtn) cancelCreateCustomerBtn.onclick = window.closeCreateCustomerModal;

    if (btnGenUsername) {
        btnGenUsername.onclick = () => {
            document.getElementById("new-cust-username").value = window.generateRandomUsername();
        };
    }

    if (btnGenPassword) {
        btnGenPassword.onclick = () => {
            document.getElementById("new-cust-password").value = window.generateRandomPassword();
        };
    }

    if (createCustomerForm) {
        createCustomerForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const name = document.getElementById("new-cust-name").value.trim();
            const username = document.getElementById("new-cust-username").value.trim();
            const password = document.getElementById("new-cust-password").value.trim();

            if (!username || !password) {
                showToast("กรุณากรอก Username และ Password ให้ครบถ้วน", "warning");
                return;
            }

            // Generate new userKey
            const newKey = "user_" + Date.now();
            if (!appState.customerAccounts) appState.customerAccounts = {};
            const r = document.getElementById("new-cust-role") ? document.getElementById("new-cust-role").value : "customer";
            appState.customerAccounts[newKey] = {
                name: name,
                username: username,
                password: password,
                role: r,
                userKey: newKey
            };

            if (!appState.userPermissions) appState.userPermissions = {};
            
            const specProject = window.createUserForSpecificProject;
            const projectPermList = specProject ? [specProject] : [];
            appState.userPermissions[newKey] = { hospitals: [], projects: projectPermList };

            await saveCustomerAccounts();
            await saveUserPermissions();

            if (specProject) {
                showToast(`🎉 สร้างบัญชีผู้ใช้ "${name}" และมอบสิทธิ์เข้าถึงโครงการ ${specProject} เรียบร้อยแล้ว!`, "success");
                window.createUserForSpecificProject = null;
                const activeProj = projectsData[appState.selectedDetailProject];
                if (activeProj) {
                    renderProjectPermissions(activeProj);
                }
            } else {
                showToast(`🎉 สร้างบัญชีลูกค้า "${name}" เรียบร้อยแล้ว!`, "success");
            }
            window.closeCreateCustomerModal();

            // Copy login info automatically
            window.copyCustomerLogin(newKey);

            // Re-render
            renderPermissionsManagement();
        });
    }

    // Project-detail helper to open Create Customer modal with a pre-filled target project
    window.openCreateUserFromProjectDetail = function() {
        window.createUserForSpecificProject = appState.selectedDetailProject;
        window.openCreateCustomerModal();
    };

    // ============================================================
    // CUSTOMER DAILY REPORT SIGN-OFF SYSTEM
    // ============================================================
    const customerSignModal = document.getElementById("customer-sign-modal");
    const closeCustomerSignBtn = document.getElementById("close-customer-sign-modal");
    const cancelCustomerSignBtn = document.getElementById("cancel-customer-sign-btn");
    const customerSignForm = document.getElementById("customer-sign-form");
    const customerSigCanvas = document.getElementById("customer-signature-canvas");

    window.openCustomerSignModal = function(reportIdx) {
        if (!customerSignModal) return;
        
        const project = projectsData[appState.selectedDetailProject];
        if (!project || !project.dailyReports || !project.dailyReports[reportIdx]) return;
        
        const report = project.dailyReports[reportIdx];
        
        // Reset form
        if (customerSignForm) customerSignForm.reset();
        document.getElementById("customer-sign-report-idx").value = reportIdx;
        
        // Populate signature role dropdown
        const roleSelect = document.getElementById("customer-sign-role");
        if (roleSelect) {
            window.initSignerRoleDropdown(roleSelect, "");
        }
        
        // Clear signature canvas
        if (customerSigCanvas && customerSigCanvas.clear) {
            customerSigCanvas.clear();
        }
        
        // Display modal
        customerSignModal.style.display = "flex";
    };

    const closeCustomerSignModal = () => {
        if (customerSignModal) customerSignModal.style.display = "none";
    };

    if (closeCustomerSignBtn) closeCustomerSignBtn.addEventListener("click", closeCustomerSignModal);
    if (cancelCustomerSignBtn) cancelCustomerSignBtn.addEventListener("click", closeCustomerSignModal);
    
    // Clear button listener
    const clearCustomerSigBtn = document.querySelector(".btn-clear-customer-sig");
    if (clearCustomerSigBtn && customerSigCanvas) {
        clearCustomerSigBtn.addEventListener("click", () => {
            if (customerSigCanvas.clear) customerSigCanvas.clear();
        });
    }

    // Add custom role button trigger
    const addCustomRoleBtn = document.getElementById("btn-add-custom-customer-role");
    if (addCustomRoleBtn) {
        addCustomRoleBtn.addEventListener("click", () => {
            const roleSelect = document.getElementById("customer-sign-role");
            if (roleSelect) {
                roleSelect.value = "__ADD_NEW_ROLE__";
                roleSelect.dispatchEvent(new Event("change"));
            }
        });
    }

    // Initialize signature pad drawing handlers
    if (customerSigCanvas) {
        initSignaturePad(customerSigCanvas);
    }

    // ============================================================
    // PROJECT & HOSPITAL MULTI-SHARE SYSTEM
    // ============================================================
    const portalShareModal = document.getElementById("portal-share-modal");
    const btnPortalShareProjects = document.getElementById("btn-portal-share-projects");
    const closePortalShareModal = document.getElementById("close-portal-share-modal");
    const cancelPortalShareBtn = document.getElementById("cancel-portal-share-btn");
    const btnGenerateShareLink = document.getElementById("btn-generate-share-link");
    const btnCopyShareResultUrl = document.getElementById("btn-copy-share-result-url");

    // Share modal state tracking
    const currentShareSelectedHospitals = new Set();
    const currentShareSelectedProjects = new Set();

    // Helper to render projects based on checked hospitals on the left
    function renderShareProjectsChecklist() {
        const projContainer = document.getElementById("share-projects-checkboxes");
        if (!projContainer) return;
        projContainer.innerHTML = "";

        let sortedProjects;
        if (currentShareSelectedHospitals.size === 0) {
            // Show all projects in the system by default
            sortedProjects = Object.values(projectsData)
                .sort((a, b) => b.year - a.year || a.code.localeCompare(b.code));
        } else {
            // Show only projects belonging to the checked hospitals
            sortedProjects = Object.values(projectsData)
                .filter(p => currentShareSelectedHospitals.has(p.customer))
                .sort((a, b) => b.year - a.year || a.code.localeCompare(b.code));
        }

        if (sortedProjects.length === 0) {
            projContainer.innerHTML = `<span style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 16px;">ไม่มีโครงการในระบบ</span>`;
            return;
        }

        // Group by hospital to match the permission system style
        const grouped = {};
        sortedProjects.forEach(p => {
            if (!grouped[p.customer]) grouped[p.customer] = [];
            grouped[p.customer].push(p);
        });

        Object.keys(grouped).forEach(hosp => {
            const projectCodesUnderHosp = grouped[hosp].map(p => p.code);
            const allChecked = projectCodesUnderHosp.every(code => currentShareSelectedProjects.has(code));
            const someChecked = projectCodesUnderHosp.some(code => currentShareSelectedProjects.has(code)) && !allChecked;

            const headerId = `share-hosp-header-${hosp.replace(/\s+/g, "-")}`;
            const groupHeader = document.createElement("div");
            groupHeader.className = "share-project-item-group-header";
            groupHeader.style.cssText = "display: flex; align-items: center; gap: 8px; font-size: 11.5px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: var(--primary-blue); margin-top: 14px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed var(--border-color); width: 100%;";
            groupHeader.innerHTML = `
                <input type="checkbox" id="${headerId}" style="width: 14px; height: 14px; accent-color: var(--primary-blue); cursor: pointer;" ${allChecked ? "checked" : ""}>
                <label for="${headerId}" style="cursor: pointer; font-family: 'Prompt', sans-serif; display: inline-flex; align-items: center; gap: 4px; margin: 0; user-select: none;">
                    ${hosp.replace("โรงพยาบาล", "รพ.")} <span style="font-size: 9.5px; font-weight: 500; color: var(--text-muted); text-transform: none;">(เลือกทั้งหมดใน รพ. นี้)</span>
                </label>
            `;
            projContainer.appendChild(groupHeader);

            const headerCb = groupHeader.querySelector(`#${headerId}`);
            if (headerCb) {
                headerCb.indeterminate = someChecked;
                headerCb.addEventListener("change", () => {
                    const isChecked = headerCb.checked;
                    grouped[hosp].forEach(proj => {
                        if (isChecked) {
                            currentShareSelectedProjects.add(proj.code);
                        } else {
                            currentShareSelectedProjects.delete(proj.code);
                        }
                        
                        const projCb = document.getElementById(`chk-share-p-${proj.code}`);
                        if (projCb) {
                            projCb.checked = isChecked;
                        }
                    });
                });
            }

            grouped[hosp].forEach(p => {
                const isChecked = currentShareSelectedProjects.has(p.code);
                const isQuotingStatus = (p.status === "งานที่กำลังเสนอราคา" || p.status === "กำลังเสนอราคา" || p.status === "งานที่รอเสนอราคา");
                const statusType = isQuotingStatus ? "เสนอราคา" : "งานในมือ";
                const div = document.createElement("div");
                div.className = "share-project-item";
                div.style.cssText = "display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-family: 'Prompt', sans-serif; padding: 4px 0;";
                div.innerHTML = `
                    <input type="checkbox" class="share-project-check" value="${p.code}" id="chk-share-p-${p.code}" style="width: 15px; height: 15px; cursor: pointer;" ${isChecked ? "checked" : ""}>
                    <label for="chk-share-p-${p.code}" style="cursor: pointer; font-weight: 600; color: var(--navy-dark);">${p.code} : ${p.name.replace(/ \(\d{4}\)$/, '')} <span style="font-size: 10.5px; color: var(--text-muted); font-weight: 500;">(${statusType})</span></label>
                `;
                projContainer.appendChild(div);

                const projCb = div.querySelector(`.share-project-check`);
                if (projCb) {
                    projCb.addEventListener("change", () => {
                        if (projCb.checked) {
                            currentShareSelectedProjects.add(p.code);
                        } else {
                            currentShareSelectedProjects.delete(p.code);
                        }
                        
                        // Recalculate group header checkbox state
                        const anyCheckedNow = projectCodesUnderHosp.some(code => currentShareSelectedProjects.has(code));
                        const allCheckedNow = projectCodesUnderHosp.every(code => currentShareSelectedProjects.has(code));
                        headerCb.checked = allCheckedNow;
                        headerCb.indeterminate = anyCheckedNow && !allCheckedNow;
                    });
                }
            });
        });

        // Trigger search filter if there is query text active
        const searchInput = document.getElementById("share-modal-project-search");
        if (searchInput && searchInput.value.trim()) {
            searchInput.dispatchEvent(new Event("input"));
        }
    }

    window.openPortalShareModal = function() {
        if (!portalShareModal) return;

        // Clear old selections
        currentShareSelectedHospitals.clear();
        currentShareSelectedProjects.clear();

        document.getElementById("share-link-output-container").style.display = "none";
        document.getElementById("share-link-result-url").value = "";

        // Reset search input
        const searchInput = document.getElementById("share-modal-project-search");
        if (searchInput) {
            searchInput.value = "";
        }

        // Populate dynamic hospitals
        const hospContainer = document.getElementById("share-hospitals-checkboxes");
        if (hospContainer) {
            hospContainer.innerHTML = "";
            const allHospitals = [
                "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
                "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
                "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4",
                "อื่นๆ"
            ];
            
            allHospitals.forEach(hosp => {
                const projCount = Object.values(projectsData).filter(p => p.customer === hosp).length;
                if (projCount === 0) return;
                
                const div = document.createElement("div");
                div.className = "share-hospital-item";
                div.style.cssText = "display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-family: 'Prompt', sans-serif; padding: 4px 0;";
                div.innerHTML = `
                    <input type="checkbox" class="share-hospital-check" value="${hosp}" id="chk-share-h-${hosp}" style="width: 15px; height: 15px; cursor: pointer;">
                    <label for="chk-share-h-${hosp}" style="cursor: pointer; font-weight: 600; color: var(--navy-dark);">${hosp} <span style="font-size: 10.5px; color: var(--text-muted); font-weight: 500;">(${projCount} โครงการ)</span></label>
                `;
                hospContainer.appendChild(div);

                const hospCb = div.querySelector(".share-hospital-check");
                if (hospCb) {
                    hospCb.addEventListener("change", () => {
                        if (hospCb.checked) {
                            currentShareSelectedHospitals.add(hosp);
                        } else {
                            currentShareSelectedHospitals.delete(hosp);
                        }
                        renderShareProjectsChecklist();
                    });
                }
            });

            if (hospContainer.children.length === 0) {
                hospContainer.innerHTML = `<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">ไม่มีโรงพยาบาลที่มีโครงการในระบบ</span>`;
            }
        }

        // Render projects placeholder
        renderShareProjectsChecklist();

        portalShareModal.style.display = "flex";
    };

    const closePortalShareModalFn = () => {
        if (portalShareModal) portalShareModal.style.display = "none";
    };

    if (btnPortalShareProjects) btnPortalShareProjects.addEventListener("click", window.openPortalShareModal);
    if (closePortalShareModal) closePortalShareModal.addEventListener("click", closePortalShareModalFn);
    if (cancelPortalShareBtn) cancelPortalShareBtn.addEventListener("click", closePortalShareModalFn);

    // Clear checks listeners
    const clearHospBtn = document.getElementById("btn-share-clear-hospitals");
    if (clearHospBtn) {
        clearHospBtn.addEventListener("click", () => {
            currentShareSelectedHospitals.clear();
            document.querySelectorAll(".share-hospital-check").forEach(chk => chk.checked = false);
            renderShareProjectsChecklist();
        });
    }

    const clearProjBtn = document.getElementById("btn-share-clear-projects");
    if (clearProjBtn) {
        clearProjBtn.addEventListener("click", () => {
            currentShareSelectedProjects.clear();
            renderShareProjectsChecklist();
        });
    }

    // Generate Share Link action
    if (btnGenerateShareLink) {
        btnGenerateShareLink.addEventListener("click", async () => {
            const selectedHospitals = Array.from(currentShareSelectedHospitals);
            const selectedProjectCodes = Array.from(currentShareSelectedProjects);
            
            // Filter out hospitals if the user explicitly selected specific projects under them
            const finalHospitals = [];
            selectedHospitals.forEach(hosp => {
                const projectsUnderHosp = Object.values(projectsData).filter(p => p.customer === hosp);
                const projectCodesUnderHosp = projectsUnderHosp.map(p => p.code);
                const selectedUnderHosp = projectCodesUnderHosp.filter(code => currentShareSelectedProjects.has(code));
                
                // If no specific projects under this hospital were selected on the right,
                // it means the user intends to share the whole hospital.
                // Otherwise, we only share the explicitly selected projects and exclude the hospital-wide permission.
                if (selectedUnderHosp.length === 0) {
                    finalHospitals.push(hosp);
                }
            });
            
            if (finalHospitals.length === 0 && selectedProjectCodes.length === 0) {
                showToast("กรุณาเลือกโรงพยาบาลหรือโครงการย่อยอย่างน้อย 1 รายการเพื่อแชร์", "warning");
                return;
            }
            
            // ALWAYS generate a brand new link ID
            const randomPart = Math.random().toString(36).substring(2, 9);
            const timestampPart = Date.now().toString(36);
            const linkId = `sh_${randomPart}_${timestampPart}`;
            
            const shareData = {
                type: "mixed_share",
                projectCodes: selectedProjectCodes,
                hospitals: finalHospitals,
                createdAt: new Date().toISOString()
            };
            
            showToast("กำลังสร้างลิงก์แชร์และบันทึกประวัติ...", "info");
            
            try {
                const { error } = await supabaseClient.from('projects').upsert({
                    code: `SHARE:${linkId}`,
                    data: shareData,
                    updated_at: new Date().toISOString()
                });
                
                if (error) throw error;
                
                const origin = window.location.origin || 'https://technical-water-system.vercel.app';
                const pathname = window.location.pathname || '/';
                const fullShareUrl = `${origin}${pathname}?share=${linkId}`;
                
                const urlInput = document.getElementById("share-link-result-url");
                const outputContainer = document.getElementById("share-link-output-container");
                
                urlInput.value = fullShareUrl;
                outputContainer.style.display = "block";
                
                // Auto-scroll the modal body to the top where the output container is located!
                const modalBody = document.querySelector("#portal-share-modal .modal-body");
                if (modalBody) {
                    modalBody.scrollTo({ top: 0, behavior: "smooth" });
                }
                
                // Copy to clipboard automatically for convenience
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(fullShareUrl);
                    showToast("📋 สร้างลิงก์แชร์และคัดลอกลงคลิปบอร์ดให้คุณอัตโนมัติเรียบร้อยแล้ว!", "success");
                } else {
                    urlInput.select();
                    document.execCommand("copy");
                    showToast("📋 สร้างลิงก์แชร์และคัดลอกลงคลิปบอร์ดให้คุณอัตโนมัติเรียบร้อยแล้ว!", "success");
                }
            } catch (err) {
                console.error("Failed to generate share link:", err);
                showToast("เกิดข้อผิดพลาดในการสร้างลิงก์: " + err.message, "error");
            }
        });
    }

    // Search modal filter logic
    const searchInputEl = document.getElementById("share-modal-project-search");
    if (searchInputEl) {
        searchInputEl.addEventListener("input", function() {
            const query = this.value.trim().toLowerCase();
            
            // Toggle clear search button
            const clearSearchBtn = document.getElementById("btn-clear-share-search");
            if (clearSearchBtn) {
                clearSearchBtn.style.display = query ? "inline-block" : "none";
            }
            
            // Filter projects
            document.querySelectorAll("#share-projects-checkboxes > .share-project-item").forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            });

            // Show/hide group headers based on if there are visible projects under them
            document.querySelectorAll("#share-projects-checkboxes > .share-project-item-group-header").forEach(header => {
                let sibling = header.nextElementSibling;
                let hasVisibleSibling = false;
                while (sibling && !sibling.classList.contains("share-project-item-group-header")) {
                    if (sibling.classList.contains("share-project-item") && sibling.style.display !== "none") {
                        hasVisibleSibling = true;
                        break;
                    }
                    sibling = sibling.nextElementSibling;
                }
                header.style.display = hasVisibleSibling ? "flex" : "none";
            });
            
            // Filter hospitals
            document.querySelectorAll("#share-hospitals-checkboxes > .share-hospital-item").forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            });
        });
    }

    // Clear search filter action
    const clearSearchBtn = document.getElementById("btn-clear-share-search");
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            const searchInput = document.getElementById("share-modal-project-search");
            if (searchInput) {
                searchInput.value = "";
                searchInput.dispatchEvent(new Event("input"));
            }
        });
    }

    // Copy link result action
    if (btnCopyShareResultUrl) {
        btnCopyShareResultUrl.addEventListener("click", () => {
            const urlInput = document.getElementById("share-link-result-url");
            if (!urlInput || !urlInput.value) return;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(urlInput.value).then(() => {
                    showToast("📋 คัดลอกลิงก์แชร์เรียบร้อยแล้ว!", "success");
                });
            } else {
                urlInput.select();
                document.execCommand("copy");
                showToast("📋 คัดลอกลิงก์แชร์เรียบร้อยแล้ว!", "success");
            }
        });
    }

    if (customerSignForm) {
        customerSignForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const reportIdx = parseInt(document.getElementById("customer-sign-report-idx").value);
            const name = document.getElementById("customer-sign-name").value.trim();
            const role = document.getElementById("customer-sign-role").value;
            
            if (!name || !role) {
                showToast("กรุณากรอกข้อมูลผู้รับรองให้ครบถ้วน", "warning");
                return;
            }
            
            if (!customerSigCanvas || customerSigCanvas.isEmpty()) {
                showToast("กรุณาวาดลายเซ็นของคุณลงบนกระดานด้านล่าง", "warning");
                return;
            }
            
            const projectCode = appState.selectedDetailProject;
            const project = projectsData[projectCode];
            if (!project || !project.dailyReports || !project.dailyReports[reportIdx]) return;
            
            const report = project.dailyReports[reportIdx];
            const dateVal = report.date.replace(/\//g, "-");
            
            // Get base64 Data URL from canvas
            const sigDataUrl = customerSigCanvas.toDataURL("image/png");
            
            // Generate Supabase storage key
            const sigKey = `FILE:${projectCode}:DAILY_SIG:${dateVal}:${Date.now()}:customer:${name}`;
            
            showToast("กำลังส่งลายเซ็นรับรองขึ้นระบบคลาวด์...", "info");
            
            try {
                // 1. Upload signature image to Supabase
                const { error: sigErr } = await supabaseClient.from('projects').upsert({
                    code: sigKey,
                    data: { fileUrl: sigDataUrl },
                    updated_at: new Date().toISOString()
                });
                
                if (sigErr) throw sigErr;
                
                // 2. Append signature metadata to report
                if (!report.signatures) report.signatures = [];
                report.signatures.push({
                    name: name,
                    role: role,
                    image: sigKey
                });
                
                // 3. Collect signer names/roles to autocomplete history
                if (!appState.signerNamesHistory.includes(name)) {
                    appState.signerNamesHistory.push(name);
                    localStorage.setItem("technical_water_signer_names_history", JSON.stringify(appState.signerNamesHistory));
                    if (typeof window.updateSignerNamesDatalist === "function") window.updateSignerNamesDatalist();
                }
                
                // Sync name history to database
                await supabaseClient.from('projects').upsert({
                    code: 'FILE:SIGNER_NAMES_HISTORY',
                    data: { history: appState.signerNamesHistory }
                });
                
                // 4. Save project locally and sync to Supabase
                saveToLocalStorage();
                
                showToast("🎉 เซ็นรับรองรายงานการปฏิบัติงานเรียบร้อยแล้ว!", "success");
                closeCustomerSignModal();
                
                // 5. Re-render feed
                renderSubnavDailyReports(project);
            } catch (err) {
                console.error("Failed to sign off report:", err);
                showToast("ลงนามรับรองล้มเหลว: " + err.message, "error");
            }
        });
    }

    const createProjectModal = document.getElementById("create-project-modal");
    const closeCreateProjectBtn = document.getElementById("close-create-project-modal");
    const cancelCreateProjectBtn = document.getElementById("btn-cancel-create-project");
    const createProjectForm = document.getElementById("create-project-form");

    const openCreateProjectModal = () => {
        const isQuoting = (appState.currentView === "quoting-projects-list");
        const modalTitle = createProjectModal.querySelector(".modal-title");
        const submitBtn = document.getElementById("btn-submit-create-project");
        
        const codeYearRow = document.getElementById("create-proj-code-year-row");
        const valCostRow = document.getElementById("create-proj-val-cost-row");
        const docSection = document.getElementById("create-proj-doc-section");
        const codeInput = document.getElementById("new-project-code");
        const valInput = document.getElementById("new-project-value");
        const costInput = document.getElementById("new-project-cost");
        
        const codeLabel = codeYearRow ? codeYearRow.querySelector("label[for='new-project-code']") : null;
        const quotingFields = document.getElementById("create-quoting-fields-section");

        if (isQuoting) {
            if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-file-circle-plus"></i> เพิ่มรายการเสนอราคาใหม่`;
            if (submitBtn) submitBtn.textContent = "สร้างรายการเสนอราคา";
            if (codeYearRow) codeYearRow.style.display = "flex";
            if (codeLabel) codeLabel.innerHTML = `เลขที่ใบเสนอราคา (ว่างไว้เพื่อระบบสุ่มรหัส)`;
            if (codeInput) {
                codeInput.removeAttribute("required");
                codeInput.placeholder = "เช่น QT-385041";
            }
            if (valCostRow) valCostRow.style.display = "none";
            if (docSection) docSection.style.display = "none";
            if (valInput) valInput.removeAttribute("required");
            if (costInput) costInput.removeAttribute("required");
            if (quotingFields) quotingFields.style.display = "block";
        } else {
            if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-folder-plus"></i> สร้างโครงการใหม่`;
            if (submitBtn) submitBtn.textContent = "สร้างโครงการ";
            if (codeYearRow) codeYearRow.style.display = "flex";
            if (codeLabel) codeLabel.innerHTML = `รหัสโครงการ <span class="required">*</span>`;
            if (codeInput) {
                codeInput.setAttribute("required", "true");
                codeInput.placeholder = "เช่น PRJ-2613";
            }
            if (valCostRow) valCostRow.style.display = "flex";
            if (docSection) docSection.style.display = "block";
            if (valInput) valInput.setAttribute("required", "true");
            if (costInput) costInput.setAttribute("required", "true");
            if (quotingFields) quotingFields.style.display = "none";
        }

        const hasDraft = sessionStorage.getItem("draft_create_project");
        if (!hasDraft) {
            document.getElementById("new-project-code").value = "";
            document.getElementById("new-project-name").value = "";
            document.getElementById("new-project-value").value = "";
            document.getElementById("new-project-cost").value = "";
            const newHospEl = document.getElementById("new-project-hospital");
            if (newHospEl) newHospEl.selectedIndex = 0;
            const otherGroup = document.getElementById("create-proj-hospital-other-group");
            if (otherGroup) otherGroup.style.display = "none";
            const otherInput = document.getElementById("new-project-hospital-other");
            if (otherInput) {
                otherInput.value = "";
                otherInput.removeAttribute("required");
            }
            const managerEl = document.getElementById("new-project-manager");
            if (managerEl) managerEl.value = "";
            
            const docFileEl = document.getElementById("create-proj-doc-file");
            if (docFileEl) docFileEl.value = "";
            const docTypeEl = document.getElementById("create-proj-doc-type");
            if (docTypeEl) docTypeEl.value = "Contract";

            // Clear quoting fields
            const siteVisitEl = document.getElementById("new-quoting-site-visit-date");
            const boqFileEl = document.getElementById("new-quoting-boq-file");
            const comp1El = document.getElementById("new-quoting-comparison-1");
            const comp2El = document.getElementById("new-quoting-comparison-2");
            const remarksEl = document.getElementById("new-quoting-remarks");
            if (siteVisitEl) siteVisitEl.value = "";
            if (boqFileEl) boqFileEl.value = "";
            if (comp1El) comp1El.value = "";
            if (comp2El) comp2El.value = "";
            if (remarksEl) remarksEl.value = "";
        }
        createProjectModal.classList.add("active");
    };

    const closeCreateProjectModal = () => {
        createProjectModal.classList.remove("active");
    };

    const sidebarCreateProjectBtn = document.getElementById("sidebar-create-project-btn");
    if (sidebarCreateProjectBtn) {
        sidebarCreateProjectBtn.addEventListener("click", openCreateProjectModal);
    }
    const headerCreateProjectBtn = document.getElementById("header-create-project-btn");
    if (headerCreateProjectBtn) {
        headerCreateProjectBtn.addEventListener("click", openCreateProjectModal);
    }
    
    // S-Curve Grid Buttons
    const scurveViewModeSelect = document.getElementById("scurve-view-mode-select");
    if (scurveViewModeSelect) {
        scurveViewModeSelect.addEventListener("change", function() {
            const code = appState.selectedDetailProject;
            if (!code || code === "all") return;
            const proj = projectsData[code];
            if (!proj) return;
            
            // Sync DOM before switching mode
            syncScurveDOMToObject(proj);
            
            proj.scurveViewMode = scurveViewModeSelect.value;
            syncScurveMonthsWithGantt(proj);
            calculatePlanScurveFromGantt(proj);
            renderSubnavActualProgress(proj);
        });
    }

    const togglePlanModeBtn = document.getElementById("toggle-plan-mode");
    const toggleActualModeBtn = document.getElementById("toggle-actual-mode");

    if (togglePlanModeBtn) {
        togglePlanModeBtn.addEventListener("click", function() {
            currentScurveMode = 'plan';
            togglePlanModeBtn.className = "active";
            togglePlanModeBtn.style.background = "#e0e7ff";
            togglePlanModeBtn.style.color = "#1e40af";
            toggleActualModeBtn.className = "";
            toggleActualModeBtn.style.background = "#f8fafc";
            toggleActualModeBtn.style.color = "var(--text-muted)";
            const code = appState.selectedDetailProject;
            if (code && code !== "all" && projectsData[code]) {
                renderSubnavActualProgress(projectsData[code]);
            }
        });
    }

    if (toggleActualModeBtn) {
        toggleActualModeBtn.addEventListener("click", function() {
            currentScurveMode = 'actual';
            toggleActualModeBtn.className = "active";
            toggleActualModeBtn.style.background = "#e0e7ff";
            toggleActualModeBtn.style.color = "#1e40af";
            togglePlanModeBtn.className = "";
            togglePlanModeBtn.style.background = "#f8fafc";
            togglePlanModeBtn.style.color = "var(--text-muted)";
            const code = appState.selectedDetailProject;
            if (code && code !== "all" && projectsData[code]) {
                renderSubnavActualProgress(projectsData[code]);
            }
        });
    }

    const btnAddScurveMonth = document.getElementById("btn-add-scurve-month");
    if (btnAddScurveMonth) {
        btnAddScurveMonth.addEventListener("click", function() {
            const code = appState.selectedDetailProject;
            if (!code || code === "all") return showToast("กรุณาเลือกโครงการเฉพาะก่อน", "warning");
            const proj = projectsData[code];
            if (!proj.scurveMonths) proj.scurveMonths = ["Month 1"];
            proj.scurveMonths.push("Month " + (proj.scurveMonths.length + 1));
            renderSubnavActualProgress(proj);
        });
    }

    const btnAddScurveMain = document.getElementById("btn-add-scurve-main-task");
    if (btnAddScurveMain) {
        btnAddScurveMain.addEventListener("click", function() {
            const code = appState.selectedDetailProject;
            if (!code || code === "all") return showToast("กรุณาเลือกโครงการเฉพาะก่อน", "warning");
            const proj = projectsData[code];
            if (!proj.scurveData) proj.scurveData = [];
            const len = (proj.scurveMonths && proj.scurveMonths.length) ? proj.scurveMonths.length * 4 : 4;
            proj.scurveData.push({
                isSubtask: false, item: '', name: '', budget: 0, weight: 0, totalPercent: 100,
                plan: new Array(len).fill(0), actual: new Array(len).fill(0)
            });
            renderSubnavActualProgress(proj);
            showToast("เพิ่มงานหลักเรียบร้อย", "info");
        });
    }

    const btnAddScurveSub = document.getElementById("btn-add-scurve-sub-task");
    if (btnAddScurveSub) {
        btnAddScurveSub.addEventListener("click", function() {
            const code = appState.selectedDetailProject;
            if (!code || code === "all") return showToast("กรุณาเลือกโครงการเฉพาะก่อน", "warning");
            const proj = projectsData[code];
            if (!proj.scurveData) proj.scurveData = [];
            const len = (proj.scurveMonths && proj.scurveMonths.length) ? proj.scurveMonths.length * 4 : 4;
            proj.scurveData.push({
                isSubtask: true, name: '',
                plan: new Array(len).fill(0), actual: new Array(len).fill(0)
            });
            renderSubnavActualProgress(proj);
            showToast("เพิ่มงานย่อยเรียบร้อย", "info");
        });
    }
    
    const btnSaveScurveData = document.getElementById("btn-save-scurve-data");
    const btnPrintScurve = document.getElementById("btn-print-scurve");
    if (btnSaveScurveData) {
        btnSaveScurveData.addEventListener("click", function() {
            const code = appState.selectedDetailProject;
            if (!code || code === "all") {
                showToast("กรุณาเลือกโครงการเฉพาะก่อนบันทึก", "warning");
                return;
            }
            const proj = projectsData[code];
            if (!proj || !proj.scurveData) return;
            
            // Read month names
            const monthInputs = document.querySelectorAll('.scurve-month-name');
            if (monthInputs && monthInputs.length > 0) {
                proj.scurveMonths = Array.from(monthInputs).map(inp => inp.value.trim() || 'Month');
            }

            // Read values from DOM inputs
            proj.scurveData.forEach((item, idx) => {
                const itemEl = document.querySelector(`.scurve-item-num[data-idx="${idx}"]`);
                const nameEl = document.querySelector(`.scurve-item-name[data-idx="${idx}"]`);
                const budgetEl = document.querySelector(`.scurve-budget[data-idx="${idx}"]`);
                const weightEl = document.querySelector(`.scurve-weight[data-idx="${idx}"]`);
                const totalPctEl = document.querySelector(`.scurve-total-pct[data-idx="${idx}"]`);

                if (nameEl) item.name = nameEl.value.trim();
                if (!item.isSubtask) {
                    if (itemEl) item.item = itemEl.value.trim();
                    if (budgetEl) item.budget = parseFloat(budgetEl.value.replace(/,/g, "")) || 0;
                    if (weightEl) item.weight = parseFloat(weightEl.value) || 0;
                    if (totalPctEl) item.totalPercent = parseFloat(totalPctEl.value) || 0;
                }
                
                const cellVals = document.querySelectorAll(`.scurve-cell-val[data-idx="${idx}"]`);
                cellVals.forEach(cell => {
                    const wIdx = parseInt(cell.getAttribute('data-widx'));
                    const val = parseFloat(cell.value) || 0;
                    if (currentScurveMode === 'plan') {
                        if (!item.plan) item.plan = [];
                        item.plan[wIdx] = val;
                    } else {
                        if (!item.actual) item.actual = [];
                        item.actual[wIdx] = val;
                    }
                });
            });
            
            // Save cumulative plan values
            const planCumVals = document.querySelectorAll('.scurve-plan-cum-val');
            if (planCumVals && planCumVals.length > 0) {
                if (!proj.scurvePlanCum) proj.scurvePlanCum = [];
                planCumVals.forEach(cell => {
                    const wIdx = parseInt(cell.getAttribute('data-widx'));
                    const val = parseFloat(cell.value) || 0;
                    proj.scurvePlanCum[wIdx] = val;
                });
            }
            recalculateJobsFromTasks(proj);
            saveToLocalStorage();
            renderSubnavActualProgress(proj);
            showToast("บันทึกข้อมูลแผนงาน S-Curve เรียบร้อยแล้ว!", "success");
        });
    }

    if (btnPrintScurve) {
        btnPrintScurve.addEventListener("click", function() {
            const code = appState.selectedDetailProject;
            if (!code || code === "all") {
                showToast("กรุณาเลือกโครงการเฉพาะก่อนพิมพ์", "warning");
                return;
            }
            const proj = projectsData[code];
            if (!proj) return;

            // Generate S-Curve Chart Image
            const scurveCanvas = document.getElementById("scurve-chart-canvas");
            let scurveImgHtml = "";
            if (scurveCanvas) {
                try {
                    const imgData = scurveCanvas.toDataURL("image/png");
                    scurveImgHtml = `
                        <div style="text-align: center; margin-bottom: 25px; page-break-inside: avoid;">
                            <img src="${imgData}" style="max-width: 100%; height: auto; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;" alt="S-Curve Chart">
                        </div>
                    `;
                } catch(e) {
                    console.error("Failed to generate S-Curve chart image:", e);
                }
            }

            // Gather headers
            const hideBudget = (appState.currentRole === "pe" || appState.currentRole === "customer" || appState.currentRole === "technician" || appState.currentRole === "tech");
            const hideWeight = (appState.currentRole === "customer");
            
            const isPlanMode = currentScurveMode === 'plan';
            const modeTextTh = isPlanMode ? "แผนงาน (Plan)" : "ผลงานจริง (Actual)";

            // Build headers row
            let monthsHeaderHtml = "";
            let weeksHeaderHtml = "";
            (proj.scurveMonths || ["Month 1"]).forEach((month, mIdx) => {
                monthsHeaderHtml += `<th colspan="4" style="border: 1px solid #94a3b8; padding: 6px; background: #e2e8f0; font-size: 11px;">${month}</th>`;
                for (let w = 1; w <= 4; w++) {
                    weeksHeaderHtml += `<th style="border: 1px solid #94a3b8; padding: 4px 2px; font-size: 10px; font-weight: bold; width: 35px; text-align: center;">${w}</th>`;
                }
            });

            // Build rows
            let rowsHtml = "";
            (proj.scurveData || []).forEach((item, idx) => {
                const isSub = item.isSubtask;
                const indentStyle = isSub ? "padding-left: 20px;" : "";
                const prefix = isSub ? "- " : "";
                const nameWeight = isSub ? "normal" : "bold";
                const rowBg = isSub ? "" : "background: #f8fafc;";

                // Weekly cells
                let weeklyCellsHtml = "";
                const vals = isPlanMode ? (item.plan || []) : (item.actual || []);
                const limit = (proj.scurveMonths || ["Month 1"]).length * 4;
                for (let i = 0; i < limit; i++) {
                    const val = vals[i] || 0;
                    const valStr = val === 0 ? "" : (isPlanMode ? val.toFixed(1) : val);
                    weeklyCellsHtml += `<td style="border: 1px solid #94a3b8; text-align: center; padding: 4px; font-size: 10.5px;">${valStr}</td>`;
                }

                rowsHtml += `
                    <tr style="${rowBg}">
                        <td style="text-align: center; border: 1px solid #94a3b8; font-size: 11px;">${isSub ? '' : (item.item || '')}</td>
                        <td style="border: 1px solid #94a3b8; padding: 6px; text-align: left; font-size: 11px; font-weight: ${nameWeight}; ${indentStyle}">${prefix}${item.name || ''}</td>
                        ${hideBudget ? '' : `<td style="border: 1px solid #94a3b8; text-align: right; padding: 6px; font-size: 11px;">${isSub ? '' : (item.budget ? formatNumber(item.budget) : '0')}</td>`}
                        ${hideWeight ? '' : `<td style="border: 1px solid #94a3b8; text-align: center; padding: 6px; font-size: 11px; font-weight: bold;">${isSub ? '' : (item.weight ? item.weight.toFixed(2) : '0.00')}</td>`}
                        <td style="border: 1px solid #94a3b8; text-align: center; padding: 6px; font-size: 11px; font-weight: bold;">${isSub ? '' : (item.totalPercent || 0)}%</td>
                        ${weeklyCellsHtml}
                    </tr>
                `;
            });

            // Open print window
            const printWindow = window.open("", "_blank");
            if (!printWindow) return showToast("Pop-up blocker เปิดใช้งานอยู่ กรุณาอนุญาตให้เปิดหน้าต่างใหม่", "warning");

            printWindow.document.write(`
                <html>
                <head>
                    <title>พิมพ์รายงาน S-Curve - ${proj.name}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&display=swap');
                        body {
                            font-family: 'Prompt', sans-serif;
                            padding: 20px;
                            color: #334155;
                            background: #fff;
                        }
                        .company-header {
                            display: flex;
                            align-items: center;
                            gap: 15px;
                            border-bottom: 2px solid #1e3a8a;
                            padding-bottom: 12px;
                            margin-bottom: 15px;
                        }
                        .company-info {
                            text-align: left;
                        }
                        .company-info h1 {
                            font-size: 14px;
                            color: #1e3a8a;
                            margin: 0 0 4px 0;
                            font-weight: 700;
                        }
                        .company-info p {
                            font-size: 9px;
                            color: #64748b;
                            margin: 0;
                        }
                        .doc-meta {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                            font-size: 11px;
                            margin-bottom: 15px;
                            border: 1px solid #cbd5e1;
                            padding: 10px;
                            border-radius: 6px;
                        }
                        .doc-meta-item {
                            display: flex;
                            gap: 6px;
                        }
                        .doc-meta-label {
                            font-weight: 600;
                            color: #334155;
                            min-width: 90px;
                        }
                        .report-title {
                            font-size: 14px;
                            font-weight: 700;
                            text-align: center;
                            margin-bottom: 15px;
                            color: #1e3a8a;
                            text-decoration: underline;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 10.5px;
                            margin-top: 10px;
                        }
                        th, td {
                            border: 1px solid #94a3b8;
                            padding: 5px;
                            text-align: center;
                        }
                        th {
                            background: #e2e8f0;
                            font-weight: bold;
                        }
                        @media print {
                            body {
                                padding: 0 !important;
                            }
                            .no-print {
                                display: none !important;
                            }
                            @page {
                                size: A4 landscape;
                                margin: 10mm;
                            }
                            table {
                                width: 100% !important;
                                max-width: 100% !important;
                                table-layout: auto !important;
                            }
                        }
                        @media screen {
                            body {
                                padding-top: 70px !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <!-- Floating print toolbar (Screen only) -->
                    <div class="no-print" style="position: fixed; top: 0; left: 0; right: 0; background: #1e293b; color: #fff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: 'Prompt', sans-serif;">
                        <span style="font-size: 14px; font-weight: 500;">ตัวอย่างรายงาน S-Curve & Progress (S-Curve Report Preview) - [ข้อมูลฝั่ง: ${modeTextTh}]</span>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Prompt', sans-serif;">
                                <i class="fa-solid fa-print"></i> พิมพ์ / บันทึก PDF
                            </button>
                            <button onclick="window.close()" style="background: #475569; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; font-family: 'Prompt', sans-serif;">
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>

                    <div class="company-header">
                        <img src="${window.location.origin}/logo.png" style="height: 65px; width: auto; object-fit: contain;" alt="TECHNICAL WATER Logo">
                        <div class="company-info">
                            <h1>บริษัท เทคนิคอล วอเตอร์ จำกัด (TECHNICAL WATER CO., LTD.)</h1>
                            <p>301/856 ซอยรามคำแหง 68 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240</p>
                            <p>เบอร์โทร (Tel): 02-735-3022 | E-mail: technicalwater2015@gmail.com</p>
                        </div>
                    </div>
                    
                    <div class="doc-meta">
                        <div class="doc-meta-item"><span class="doc-meta-label">วันที่พิมพ์:</span> <span>${new Date().toLocaleDateString('th-TH')}</span></div>
                        <div class="doc-meta-item"><span class="doc-meta-label">โครงการ:</span> <span>${proj.name}</span></div>
                        <div class="doc-meta-item"><span class="doc-meta-label">รหัสโครงการ:</span> <span>${proj.code || '-'}</span></div>
                        <div class="doc-meta-item"><span class="doc-meta-label">ข้อมูลแสดงผล:</span> <span>สถิติความคืบหน้าฝั่ง: ${modeTextTh}</span></div>
                    </div>

                    <div class="report-title">รายงานความคืบหน้าและกราฟ S-Curve โครงการ: ${proj.name}</div>

                    <!-- Canvas Chart rendered as Image -->
                    ${scurveImgHtml}

                    <!-- Progress Table -->
                    <table>
                        <thead>
                            <tr style="background: #e2e8f0;">
                                <th rowspan="2" style="width: 50px;">Items</th>
                                <th rowspan="2">Description</th>
                                ${hideBudget ? '' : '<th rowspan="2" style="width: 95px;">Budget</th>'}
                                ${hideWeight ? '' : '<th rowspan="2" style="width: 55px;">%</th>'}
                                <th rowspan="2" style="width: 65px;">% (รวม)</th>
                                ${monthsHeaderHtml}
                            </tr>
                            <tr>
                                ${weeksHeaderHtml}
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }

    // Gantt Chart Event Listeners
    const btnAddGanttPhase = document.getElementById("btn-add-gantt-phase");
    const btnAddGanttType = document.getElementById("btn-add-gantt-type");
    const btnAddGanttCat = document.getElementById("btn-add-gantt-cat");
    const btnAddGanttTask = document.getElementById("btn-add-gantt-task");
    const btnSaveGantt = document.getElementById("btn-save-gantt");
    const btnPrintGantt = document.getElementById("btn-print-gantt");

    const ganttStartDate = document.getElementById("gantt-start-date");
    const ganttEndDate = document.getElementById("gantt-end-date");

    const brushRed = document.getElementById("brush-red");
    const brushYellow = document.getElementById("brush-yellow");
    const brushGreen = document.getElementById("brush-green");
    const brushOrange = document.getElementById("brush-orange");
    const brushBlack = document.getElementById("brush-black");
    const brushEraser = document.getElementById("brush-eraser");

    // Dynamic Row Actions Helpers
    const getActiveProj = () => {
        const code = appState.selectedDetailProject;
        return (code && code !== "all") ? projectsData[code] : null;
    };

    // Helper: insert at selected position or push to end
    function ganttInsertAt(tasks, newItem) {
        if (ganttSelectedRowIdx >= 0 && ganttSelectedRowIdx < tasks.length) {
            const insertPos = ganttSelectedRowIdx + 1;
            tasks.splice(insertPos, 0, newItem);
            ganttSelectedRowIdx = insertPos; // Select the newly inserted row
        } else {
            tasks.push(newItem);
            ganttSelectedRowIdx = tasks.length - 1;
        }
    }

    if (btnAddGanttPhase) {
        btnAddGanttPhase.addEventListener("click", function() {
            const proj = getActiveProj();
            if (!proj) return showToast("กรุณาเลือกโครงการเฉพาะก่อน", "warning");
            ganttInsertAt(proj.ganttData.tasks, {
                id: Math.random().toString(36).substr(2, 9),
                rowType: 'phase',
                itemNum: "",
                name: ""
            });
            window.ganttIsDirty = true;
            renderSubnavPlanWork(proj);
            showToast("เพิ่ม Phase เรียบร้อย" + (ganttSelectedRowIdx >= 0 ? " (แทรกหลังแถวที่เลือก)" : ""), "info");
        });
    }

    if (btnAddGanttType) {
        btnAddGanttType.addEventListener("click", function() {
            const proj = getActiveProj();
            if (!proj) return showToast("กรุณาเลือกโครงการเฉพาะก่อน", "warning");
            ganttInsertAt(proj.ganttData.tasks, {
                id: Math.random().toString(36).substr(2, 9),
                rowType: 'type',
                itemNum: "",
                name: ""
            });
            window.ganttIsDirty = true;
            renderSubnavPlanWork(proj);
            showToast("เพิ่มประเภทงานเรียบร้อย" + (ganttSelectedRowIdx >= 0 ? " (แทรกหลังแถวที่เลือก)" : ""), "info");
        });
    }

    if (btnAddGanttCat) {
        btnAddGanttCat.addEventListener("click", function() {
            const proj = getActiveProj();
            if (!proj) return showToast("กรุณาเลือกโครงการเฉพาะก่อน", "warning");
            ganttInsertAt(proj.ganttData.tasks, {
                id: Math.random().toString(36).substr(2, 9),
                rowType: 'category',
                itemNum: "",
                name: ""
            });
            window.ganttIsDirty = true;
            renderSubnavPlanWork(proj);
            showToast("เพิ่มหมวดงานเรียบร้อย" + (ganttSelectedRowIdx >= 0 ? " (แทรกหลังแถวที่เลือก)" : ""), "info");
        });
    }

    if (btnAddGanttTask) {
        btnAddGanttTask.addEventListener("click", function() {
            const proj = getActiveProj();
            if (!proj) return showToast("กรุณาเลือกโครงการเฉพาะก่อน", "warning");
            ganttInsertAt(proj.ganttData.tasks, {
                id: Math.random().toString(36).substr(2, 9),
                rowType: 'task',
                isSubtask: false,
                itemNum: "",
                name: "",
                cells: {}
            });
            window.ganttIsDirty = true;
            renderSubnavPlanWork(proj);
            showToast("เพิ่มงานย่อยเรียบร้อย" + (ganttSelectedRowIdx >= 0 ? " (แทรกหลังแถวที่เลือก)" : ""), "info");
        });
    }

    // Brush Toggles
    const updateBrushUI = (activeBrush) => {
        currentGanttBrush = activeBrush;
        [brushRed, brushYellow, brushGreen, brushOrange, brushBlack, brushEraser].forEach(btn => {
            if (btn) btn.style.opacity = "0.75";
        });
        if (activeBrush === 'red' && brushRed) brushRed.style.opacity = "1";
        if (activeBrush === 'yellow' && brushYellow) brushYellow.style.opacity = "1";
        if (activeBrush === 'green' && brushGreen) brushGreen.style.opacity = "1";
        if (activeBrush === 'orange' && brushOrange) brushOrange.style.opacity = "1";
        if (activeBrush === 'black' && brushBlack) brushBlack.style.opacity = "1";
        if (activeBrush === 'eraser' && brushEraser) brushEraser.style.opacity = "1";
    };

    if (brushRed) brushRed.addEventListener("click", () => updateBrushUI('red'));
    if (brushYellow) brushYellow.addEventListener("click", () => updateBrushUI('yellow'));
    if (brushGreen) brushGreen.addEventListener("click", () => updateBrushUI('green'));
    if (brushOrange) brushOrange.addEventListener("click", () => updateBrushUI('orange'));
    if (brushBlack) brushBlack.addEventListener("click", () => updateBrushUI('black'));
    if (brushEraser) brushEraser.addEventListener("click", () => updateBrushUI('eraser'));
    updateBrushUI('red');

    // Date changes
    if (ganttStartDate) {
        ganttStartDate.addEventListener("change", function() {
            const proj = getActiveProj();
            if (proj) {
                proj.ganttData.startDate = this.value;
                window.ganttIsDirty = true;
                renderSubnavPlanWork(proj);
            }
        });
    }

    if (ganttEndDate) {
        ganttEndDate.addEventListener("change", function() {
            const proj = getActiveProj();
            if (proj) {
                proj.ganttData.endDate = this.value;
                window.ganttIsDirty = true;
                renderSubnavPlanWork(proj);
            }
        });
    }

    // Save Action
    if (btnSaveGantt) {
        btnSaveGantt.addEventListener("click", function() {
            const proj = getActiveProj();
            if (!proj) return showToast("กรุณาเลือกโครงการเฉพาะก่อน", "warning");

            // Read header info from DOM
            const docDateVal = document.getElementById("gantt-doc-date").value.trim();
            const docSubjectVal = document.getElementById("gantt-doc-subject").value.trim();
            const docToVal = document.getElementById("gantt-doc-to").value.trim();
            const docRefVal = document.getElementById("gantt-doc-ref").value.trim();

            proj.ganttData.header.date = docDateVal;
            proj.ganttData.header.subject = docSubjectVal;
            proj.ganttData.header.to = docToVal;
            proj.ganttData.header.refPo = docRefVal;

            window.ganttIsDirty = false; // Reset dirty tracker on save
            saveToLocalStorage();
            renderSubnavPlanWork(proj);
            showToast("บันทึกแผนการดำเนินงาน (Gantt Chart) เรียบร้อยแล้ว!", "success");
        });
    }

    // Print Action
    if (btnPrintGantt) {
        btnPrintGantt.addEventListener("click", function() {
            const proj = getActiveProj();
            if (!proj) return showToast("กรุณาเลือกโครงการเฉพาะก่อน", "warning");

            const formatYmdToTh = (ymdStr) => {
                if (!ymdStr) return '-';
                const parts = ymdStr.split('-');
                if (parts.length !== 3) return ymdStr;
                const y = parseInt(parts[0]) + 543;
                const m = parseInt(parts[1]);
                const d = parseInt(parts[2]);
                return `${d}/${m}/${y}`;
            };

            // Gather headers and dates list based on viewMode
            const dateList = [];
            const viewMode = proj.ganttData.viewMode || "daily";

            if (proj.ganttData.startDate && proj.ganttData.endDate) {
                const [sy, sm, sd] = proj.ganttData.startDate.split('-').map(Number);
                const [ey, em, ed] = proj.ganttData.endDate.split('-').map(Number);
                const start = new Date(sy, sm - 1, sd);
                const end = new Date(ey, em - 1, ed);

                if (viewMode === "daily") {
                    let current = new Date(start);
                    let count = 0;
                    while (current <= end && count < 150) {
                        dateList.push(new Date(current));
                        current.setDate(current.getDate() + 1);
                        count++;
                    }
                } else if (viewMode === "weekly") {
                    let current = new Date(start);
                    let count = 0;
                    while (current <= end && count < 104) {
                        dateList.push(new Date(current));
                        current.setDate(current.getDate() + 7);
                        count++;
                    }
                } else if (viewMode === "monthly") {
                    let current = new Date(start.getFullYear(), start.getMonth(), 1);
                    let count = 0;
                    while (current <= end && count < 60) {
                        dateList.push(new Date(current));
                        current.setMonth(current.getMonth() + 1);
                        count++;
                    }
                }
            }

            if (dateList.length === 0) {
                return showToast("กรุณากำหนดช่วงวันที่เริ่มต้นและสิ้นสุดก่อนพิมพ์", "warning");
            }

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

            // Build print layout
            const printWindow = window.open("", "_blank");
            if (!printWindow) return showToast("Pop-up blocker เปิดใช้งานอยู่ กรุณาอนุญาตให้เปิดหน้าต่างใหม่", "warning");

            let rowsHtml = "";
            proj.ganttData.tasks.forEach(task => {
                // Backward compatibility migration in print
                if (!task.rowType) {
                    if (task.isHeader) {
                        task.rowType = 'phase';
                    } else {
                        task.rowType = 'task';
                    }
                }

                if (task.rowType === 'phase') {
                    rowsHtml += `
                        <tr class="header-row" style="background: #e2e8f0; font-weight: bold;">
                            <td style="text-align: center; font-weight: bold; border: 1px solid #94a3b8;">${task.itemNum || ''}</td>
                            <td colspan="${dateList.length + 1}" style="font-weight: bold; border: 1px solid #94a3b8; text-align: left; padding: 6px;">${task.name || ''}</td>
                        </tr>
                    `;
                } else if (task.rowType === 'type') {
                    rowsHtml += `
                        <tr class="header-row" style="background: #eff6ff; font-weight: bold; color: #1e40af;">
                            <td style="text-align: center; font-weight: bold; border: 1px solid #94a3b8; color: #1e40af;">${task.itemNum || ''}</td>
                            <td colspan="${dateList.length + 1}" style="font-weight: bold; border: 1px solid #94a3b8; text-align: left; padding: 6px; color: #1e40af;">${task.name || ''}</td>
                        </tr>
                    `;
                } else if (task.rowType === 'category') {
                    rowsHtml += `
                        <tr class="header-row" style="background: #ffffff; font-weight: bold;">
                            <td style="text-align: center; font-weight: bold; border: 1px solid #94a3b8;">${task.itemNum || ''}</td>
                            <td colspan="${dateList.length + 1}" style="font-weight: bold; border: 1px solid #94a3b8; text-align: left; padding: 6px; text-decoration: underline;">${task.name || ''}</td>
                        </tr>
                    `;
                } else {
                    const indentStyle = task.isSubtask ? "padding-left: 20px;" : "";
                    const prefix = task.isSubtask ? "- " : "";
                    let gridCellsHtml = "";
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
                        if (noise === 1) cellBg = "class='cell-yellow'";
                        else if (noise === 2) cellBg = "class='cell-green'";
                        else if (noise === 3) cellBg = "class='cell-red'";

                        let triangleHtml = "";
                        if (shift === 'day') {
                            triangleHtml = `<div style="position: absolute; top: 0; left: 0; width: 0; height: 0; border-top: 11px solid #f97316 !important; border-right: 11px solid transparent !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; pointer-events: none;"></div>`;
                        } else if (shift === 'night') {
                            triangleHtml = `<div style="position: absolute; top: 0; left: 0; width: 0; height: 0; border-top: 11px solid #000000 !important; border-right: 11px solid transparent !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; pointer-events: none;"></div>`;
                        }

                        let cellWidthStyle = "width: 18px; min-width: 18px; max-width: 18px;";
                        if (viewMode === "weekly") {
                            cellWidthStyle = "min-width: 50px;";
                        } else if (viewMode === "monthly") {
                            cellWidthStyle = "min-width: 55px;";
                        }

                        gridCellsHtml += `<td ${cellBg} style="position: relative; border: 1px solid #94a3b8; ${cellWidthStyle} height: 28px;">${triangleHtml}</td>`;
                    });

                    rowsHtml += `
                        <tr>
                            <td style="text-align: center; border: 1px solid #94a3b8;">${task.itemNum || ''}</td>
                            <td class="desc-col" style="border: 1px solid #94a3b8; padding: 6px; ${indentStyle}">${prefix}${task.name || ''}</td>
                            ${gridCellsHtml}
                        </tr>
                    `;
                }
            });

            let monthsHeaderHtml = "";
            monthGroups.forEach(grp => {
                monthsHeaderHtml += `<th colspan="${grp.colspan}" style="border: 1px solid #94a3b8; padding: 6px;">${grp.name}</th>`;
            });

            let daysHeaderHtml = "";
            dateList.forEach((d, i) => {
                let label = "";
                let cellWidthStyle = "width: 18px; min-width: 18px; max-width: 18px;";
                if (viewMode === "daily") {
                    label = d.getDate();
                } else if (viewMode === "weekly") {
                    label = `W${i + 1} (${d.getDate()})`;
                    cellWidthStyle = "min-width: 50px;";
                } else if (viewMode === "monthly") {
                    label = monthThaiNames[d.getMonth()].substring(0, 3);
                    cellWidthStyle = "min-width: 55px;";
                }
                daysHeaderHtml += `<th style="border: 1px solid #94a3b8; font-size: 10px; font-weight: bold; ${cellWidthStyle} padding: 4px 2px; text-align: center;">${label}</th>`;
            });

            printWindow.document.write(`
                <html>
                <head>
                    <title>พิมพ์แผนงาน - ${proj.name}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&display=swap');
                        body {
                            font-family: 'Prompt', sans-serif;
                            padding: 20px;
                            color: #334155;
                            background: #fff;
                        }
                        .company-header {
                            display: flex;
                            align-items: center;
                            gap: 15px;
                            border-bottom: 2px solid #1e3a8a;
                            padding-bottom: 12px;
                            margin-bottom: 15px;
                        }
                        .logo-box {
                            width: 60px;
                            height: 60px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: #1e3a8a;
                            color: #fff;
                            font-weight: bold;
                            border-radius: 8px;
                            font-size: 24px;
                        }
                        .company-info h1 {
                            font-size: 14px;
                            color: #1e3a8a;
                            margin: 0 0 4px 0;
                            font-weight: 700;
                        }
                        .company-info p {
                            font-size: 9px;
                            color: #64748b;
                            margin: 0;
                        }
                        .doc-meta {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                            font-size: 11px;
                            margin-bottom: 15px;
                            border: 1px solid #cbd5e1;
                            padding: 10px;
                            border-radius: 6px;
                        }
                        .doc-meta-item {
                            display: flex;
                            gap: 6px;
                        }
                        .doc-meta-label {
                            font-weight: 600;
                            color: #334155;
                            min-width: 90px;
                        }
                        .gantt-title {
                            font-size: 14px;
                            font-weight: 700;
                            text-align: center;
                            margin-bottom: 15px;
                            color: #1e3a8a;
                            text-decoration: underline;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 9px;
                        }
                        th, td {
                            border: 1px solid #94a3b8;
                            padding: 4px;
                            text-align: center;
                        }
                        th {
                            background: #e2e8f0;
                            font-weight: bold;
                        }
                        .header-row {
                            background: #f1f5f9;
                        }
                        .desc-col {
                            text-align: left !important;
                        }
                        .cell-yellow {
                            background-color: #fcd34d !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .cell-green {
                            background-color: #22c55e !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .cell-red {
                            background-color: #f87171 !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        @media print {
                            body {
                                padding: 0 !important;
                            }
                            .no-print {
                                display: none !important;
                            }
                            @page {
                                size: A4 landscape;
                                margin: 10mm;
                            }
                            table {
                                width: 100% !important;
                                max-width: 100% !important;
                                table-layout: auto !important;
                            }
                        }
                        @media screen {
                            body {
                                padding-top: 70px !important;
                            }
                        }
                        /* Increase font sizes and weight in exported Gantt table */
                        table {
                            font-size: 11.5px !important;
                        }
                        th {
                            font-size: 12px !important;
                            font-weight: bold !important;
                        }
                        td {
                            font-size: 11.5px !important;
                        }
                    </style>
                </head>
                <body>
                    <!-- Floating print toolbar (Screen only) -->
                    <div class="no-print" style="position: fixed; top: 0; left: 0; right: 0; background: #1e293b; color: #fff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: 'Prompt', sans-serif;">
                        <span style="font-size: 14px; font-weight: 500;">ตัวอย่างรายงานแผนงาน Gantt Chart (Gantt Chart Preview)</span>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Prompt', sans-serif;">
                                <i class="fa-solid fa-print"></i> พิมพ์ / บันทึก PDF
                            </button>
                            <button onclick="window.close()" style="background: #475569; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; font-family: 'Prompt', sans-serif;">
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>
                    
                    <!-- Help notice (Screen only) -->
                    <div class="no-print" style="margin: 60px auto 20px auto; max-width: 1000px; background: #fffbeb; border: 1.5px solid #fef3c7; padding: 14px 18px; border-radius: 8px; font-size: 13px; color: #b45309; line-height: 1.6; font-family: 'Prompt', sans-serif; display: flex; align-items: flex-start; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                        <i class="fa-solid fa-circle-info" style="font-size: 18px; margin-top: 2px;"></i>
                        <div>
                            <strong style="font-size: 14px;">💡 คำแนะนำสำหรับการพิมพ์ / บันทึก PDF (เพื่อไม่ให้ตารางและเดือนหลังๆ โดนตัด):</strong><br>
                            1. ในหน้าตั้งค่าเครื่องพิมพ์ขวาบน กรุณาเลือก <strong>การวางแนว (Orientation) เป็น "แนวนอน" (Landscape)</strong> (สำคัญมาก 🌟)<br>
                            2. หากระยะเวลาโครงการยาวและข้อมูลกว้างเกินหน้ากระดาษ ให้คลิก <strong>การตั้งค่าเพิ่มเติม (More settings) ➡️ สัดส่วน (Scale) ➡️ ปรับสเกลเป็น "พอดีกับหน้ากระดาษ" (Fit to page)</strong> หรือระบุเป็นตัวเลขเปอร์เซ็นต์ (เช่น 70-80%) เพื่อย่อตารางลงให้พอดีกับกระดาษ A4 ในหน้าเดียวครับ
                        </div>
                    </div>
                    <div class="company-header" style="margin-top: 10px;">
                        <img src="${window.location.origin}/logo.png" style="height: 65px; width: auto; object-fit: contain;" alt="TECHNICAL WATER Logo">
                        <div class="company-info">
                            <h1>บริษัท เทคนิคอล วอเตอร์ จำกัด (TECHNICAL WATER CO., LTD.)</h1>
                            <p>301/856 ซอยรามคำแหง 68 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240</p>
                            <p>เบอร์โทร (Tel): 02-735-3022 | E-mail: technicalwater2015@gmail.com</p>
                        </div>
                    </div>
                    
                    <div class="doc-meta">
                        <div class="doc-meta-item"><span class="doc-meta-label">วันที่:</span> <span>${proj.ganttData.header.date || '-'}</span></div>
                        <div class="doc-meta-item"><span class="doc-meta-label">เอกสารอ้างอิง:</span> <span>${proj.ganttData.header.refPo || '-'}</span></div>
                        <div class="doc-meta-item" style="grid-column: span 2;"><span class="doc-meta-label">เรื่อง:</span> <span>${proj.ganttData.header.subject || '-'}</span></div>
                        <div class="doc-meta-item" style="grid-column: span 2;"><span class="doc-meta-label">ระยะเวลาแผนงาน:</span> <span>${formatYmdToTh(proj.ganttData.startDate)} ถึง ${formatYmdToTh(proj.ganttData.endDate)}</span></div>
                    </div>

                    <div class="gantt-title">แผนงานปรับปรุงโครงการ: ${proj.name}</div>

                    <table>
                        <thead>
                            <tr style="background: #e2e8f0;">
                                <th rowspan="2" style="width: 50px;">Items</th>
                                <th rowspan="2">Description</th>
                                ${monthsHeaderHtml}
                            </tr>
                            <tr style="background: #f1f5f9;">
                                ${daysHeaderHtml}
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                    

                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }

    if (closeCreateProjectBtn) closeCreateProjectBtn.addEventListener("click", closeCreateProjectModal);
    if (cancelCreateProjectBtn) cancelCreateProjectBtn.addEventListener("click", closeCreateProjectModal);

    if (createProjectForm) {
        createProjectForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const isQuoting = (appState.currentView === "quoting-projects-list");
            let code = document.getElementById("new-project-code").value.trim().toUpperCase();
            if (!code) {
                if (isQuoting) {
                    code = "QT-" + Math.floor(100000 + Math.random() * 900000);
                } else {
                    showToast("กรุณาระบุรหัสโครงการ", "error");
                    return;
                }
            }
            const name = document.getElementById("new-project-name").value.trim();
            const year = document.getElementById("new-project-year").value || "2026";
            let hospital = document.getElementById("new-project-hospital").value;
            if (hospital === "อื่นๆ") {
                const otherVal = document.getElementById("new-project-hospital-other") ? document.getElementById("new-project-hospital-other").value.trim() : "";
                hospital = otherVal || "อื่นๆ";
            }
            const managerVal = document.getElementById("new-project-manager") ? document.getElementById("new-project-manager").value.trim() : "วิศวกรโครงการอาวุโส (PM Team)";
            const value = parseFloat(document.getElementById("new-project-value").value) || 0;
            const cost = parseFloat(document.getElementById("new-project-cost").value) || 0;
            const owner = document.getElementById("new-project-owner") ? document.getElementById("new-project-owner").value.trim() : "";
            const boq = document.getElementById("new-project-boq") ? document.getElementById("new-project-boq").value.trim() : "";
            
            // Read quoting specific fields
            let siteVisitDate = "";
            let boqFileName = "";
            let boqFileBase64 = "";
            let comparison1 = "";
            let comparison2 = "";
            let remarks = "";

            if (isQuoting) {
                const siteVisitEl = document.getElementById("new-quoting-site-visit-date");
                if (siteVisitEl) siteVisitDate = siteVisitEl.value;

                const boqFileEl = document.getElementById("new-quoting-boq-file");
                if (boqFileEl && boqFileEl.files && boqFileEl.files.length > 0) {
                    const file = boqFileEl.files[0];
                    boqFileName = file.name;
                    showToast("กำลังอัปโหลดไฟล์ BOQ...", "info");
                    const base64Res = await readFileAsBase64(file);
                    
                    const fileKey = `FILE:${code}:BOQ:${Date.now()}:${boqFileName}`;
                    const { error: fileErr } = await supabaseClient.from('projects').upsert({
                        code: fileKey,
                        data: { fileUrl: base64Res.dataUrl },
                        updated_at: new Date().toISOString()
                    });
                    if (fileErr) {
                        showToast(`อัปโหลดไฟล์ BOQ ล้มเหลว: ${fileErr.message}`, "error");
                        return;
                    }
                    window.fileCache = window.fileCache || {};
                    window.fileCache[fileKey] = base64Res.dataUrl;
                    boqFileBase64 = fileKey;
                }

                const comp1El = document.getElementById("new-quoting-comparison-1");
                if (comp1El) comparison1 = comp1El.value.trim();

                const comp2El = document.getElementById("new-quoting-comparison-2");
                if (comp2El) comparison2 = comp2El.value.trim();

                const remarksEl = document.getElementById("new-quoting-remarks");
                if (remarksEl) remarks = remarksEl.value.trim();
            }

            if (projectsData[code]) {
                showToast(`รหัส ${code} ซ้ำกับรายการที่มีอยู่แล้ว!`, "error");
                return;
            }
            
            const initialStatus = isQuoting ? "งานที่กำลังเสนอราคา" : "งานที่กำลังดำเนินการ";

            // Process project documents if uploaded
            const initialDocs = [];
            if (!isQuoting) {
                const docFileEl = document.getElementById("create-proj-doc-file");
                const docTypeEl = document.getElementById("create-proj-doc-type");
                if (docFileEl && docFileEl.files && docFileEl.files.length > 0) {
                    const file = docFileEl.files[0];
                    const docName = file.name;
                    const docType = docTypeEl ? docTypeEl.value : "Contract";
                    showToast("กำลังอัปโหลดไฟล์เอกสารโครงการ...", "info");
                    const base64Res = await readFileAsBase64(file);
                    
                    const fileKey = `FILE:${code}:DOC:${Date.now()}:${docName}`;
                    const { error: fileErr } = await supabaseClient.from('projects').upsert({
                        code: fileKey,
                        data: { fileUrl: base64Res.dataUrl },
                        updated_at: new Date().toISOString()
                    });
                    if (fileErr) {
                        showToast(`อัปโหลดเอกสารโครงการล้มเหลว: ${fileErr.message}`, "error");
                        return;
                    }
                    window.fileCache = window.fileCache || {};
                    window.fileCache[fileKey] = base64Res.dataUrl;
                    
                    const dateToday = new Date().toISOString().substring(0, 10);
                    initialDocs.push({ name: docName, type: docType, uploadedAt: dateToday, fileUrl: fileKey });
                }
            }

            // Build the mock database entry
            projectsData[code] = {
                code: code,
                year: parseInt(year),
                customer: hospital,
                name: name,
                description: `${name} ของสาขา ${hospital} ประจำปีงบประมาณ ${year}`,
                manager: managerVal || "วิศวกรโครงการอาวุโส (PM Team)",
                owner: owner || "วิศวกรโครงการอาวุโส (PM Team)",
                boq: boq,
                start: `01/01/${year}`,
                end: `31/12/${year}`,
                value: value,
                cost: cost,
                profit: value - cost,
                progress: 0,
                plannedProgress: 10,
                status: initialStatus,
                jobs: { total: 10, inprogress: 10, completed: 0, delayed: 0 },
                workBreakdown: {
                    inprogress: [2, 2, 2, 2, 2, 0],
                    completed: [0, 0, 0, 0, 0, 0],
                    delayed: [0, 0, 0, 0, 0, 0]
                },
                documents: initialDocs,
                media: [],
                expenses: [],
                dailyReports: [],
                planDocs: [],
                isSynced: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                
                // Save Quoting fields
                siteVisitDate: siteVisitDate,
                boqFileName: boqFileName,
                boqFileBase64: boqFileBase64,
                comparison1: comparison1,
                comparison2: comparison2,
                remarks: remarks
            };
            
            // Set current active project workspace to the newly created one!
            appState.selectedDetailProject = code;

            // Save and sync immediately
            saveToLocalStorage();
            
            showToast(`สร้างโครงการใหม่ ${code} เรียบร้อยแล้ว!`, "success");
            closeCreateProjectModal();
            
            // Refresh select dropdowns & dashboard data
            populateSubnavHospitals();
            populateSubnavProjects(document.getElementById("subnav-year-filter").value);
            populateCostProjects();
            
            renderOverallDashboard();
            renderSubnavProjectWorkspace();
            renderCostManagement();
        });
    }



    // 15. MODAL: Task Progress PDF Upload
    const taskPdfModal = document.getElementById("task-pdf-upload-modal");
    const closeTaskPdfBtn = document.getElementById("close-task-pdf-modal");
    const cancelTaskPdfBtn = document.getElementById("btn-cancel-task-pdf");
    const taskPdfForm = document.getElementById("task-pdf-upload-form");

    window.openTaskPdfUploadModal = (taskId) => {
        document.getElementById("upload-task-id").value = taskId;
        const fileInput = document.getElementById("task-pdf-file");
        if (fileInput) fileInput.value = "";
        if (taskPdfModal) taskPdfModal.classList.add("active");
    };

    const closeTaskPdfModal = () => {
        if (taskPdfModal) taskPdfModal.classList.remove("active");
    };

    if (closeTaskPdfBtn) closeTaskPdfBtn.addEventListener("click", closeTaskPdfModal);
    if (cancelTaskPdfBtn) cancelTaskPdfBtn.addEventListener("click", closeTaskPdfModal);

    if (taskPdfForm) {
        taskPdfForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const taskId = parseInt(document.getElementById("upload-task-id").value);
            const fileInput = document.getElementById("task-pdf-file");
            
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                const result = await readFileAsBase64(fileInput.files[0]);
                const project = projectsData[appState.selectedDetailProject];
                if (project && project.tasks) {
                    const task = project.tasks.find(t => t.id === taskId);
                    if (task) {
                        task.file = result.name;
                        
                        // Save file in separate row to keep main project payload tiny
                        const fileKey = `FILE:${project.code}:TASK:${taskId}:${result.name}`;
                        showToast("กำลังบันทึกไฟล์รายงานขึ้นคลาวด์...", "info");
                        const { error: fileErr } = await supabaseClient.from('projects').upsert({
                            code: fileKey,
                            data: { fileUrl: result.dataUrl },
                            updated_at: new Date().toISOString()
                        });
                        if (fileErr) {
                            showToast(`อัปโหลดไฟล์ล้มเหลว: ${fileErr.message}`, "error");
                            return;
                        }
                        
                        task.fileUrl = fileKey; // Reference key!
                        saveToLocalStorage();
                        showToast(`แนบรายงานความก้าวหน้า ${result.name} เรียบร้อยแล้ว!`, "success");
                        closeTaskPdfModal();
                        renderSubnavProjectWorkspace();
                    }
                }
            }
        });
    }

    // 16. MODAL: Add Project Task
    const taskModal = document.getElementById("task-modal");
    const openTaskBtn = document.getElementById("open-task-modal-btn");
    const closeTaskBtn = document.getElementById("close-task-modal");
    const cancelTaskBtn = document.getElementById("cancel-task-btn");
    const addTaskForm = document.getElementById("add-task-form");

    const openTaskModal = () => {
        document.getElementById("task-id-input").value = "";
        document.getElementById("task-modal-title").innerHTML = '<i class="fa-solid fa-tasks"></i> เพิ่มรายการงานย่อย';
        document.getElementById("task-title-input").value = "";
        document.getElementById("task-start-input").value = new Date().toISOString().substring(0, 10);
        document.getElementById("task-end-input").value = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
        document.getElementById("task-progress-input").value = "0";
        const fileInput = document.getElementById("task-ref-file");
        if (fileInput) fileInput.value = "";
        if (taskModal) taskModal.classList.add("active");
    };

    window.openEditTaskModal = (taskId) => {
        const project = projectsData[appState.selectedDetailProject];
        if (!project || !project.tasks) return;
        const task = project.tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById("task-id-input").value = task.id;
        document.getElementById("task-modal-title").innerHTML = '<i class="fa-solid fa-tasks"></i> แก้ไขรายการงานย่อย';
        document.getElementById("task-title-input").value = task.title;
        document.getElementById("task-progress-input").value = task.progress;

        const toISO = (str) => {
            if (!str) return "";
            const parts = str.split("/");
            if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
            return "";
        };
        document.getElementById("task-start-input").value = toISO(task.start);
        document.getElementById("task-end-input").value = toISO(task.end);

        const fileInput = document.getElementById("task-ref-file");
        if (fileInput) fileInput.value = "";

        if (taskModal) taskModal.classList.add("active");
    };

    const closeTaskModal = () => {
        if (taskModal) taskModal.classList.remove("active");
    };

    if (openTaskBtn) openTaskBtn.addEventListener("click", openTaskModal);
    if (closeTaskBtn) closeTaskBtn.addEventListener("click", closeTaskModal);
    if (cancelTaskBtn) cancelTaskBtn.addEventListener("click", closeTaskModal);

    if (addTaskForm) {
        addTaskForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const taskIdVal = document.getElementById("task-id-input").value;
            const title = document.getElementById("task-title-input").value.trim();
            const startVal = document.getElementById("task-start-input").value;
            const endVal = document.getElementById("task-end-input").value;
            const progress = parseFloat(document.getElementById("task-progress-input").value) || 0;
            const fileInput = document.getElementById("task-ref-file");
            
            const startDateObj = new Date(startVal);
            const endDateObj = new Date(endVal);
            const startStr = `${startDateObj.getDate().toString().padStart(2, '0')}/${(startDateObj.getMonth() + 1).toString().padStart(2, '0')}/${startDateObj.getFullYear()}`;
            const endStr = `${endDateObj.getDate().toString().padStart(2, '0')}/${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}/${endDateObj.getFullYear()}`;
            
            // Convert file to Base64 and save to separate row if a new one is selected
            let file = "";
            let fileUrl = "";
            let hasNewFile = false;
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                const result = await readFileAsBase64(fileInput.files[0]);
                file = result.name;
                
                const projectCode = appState.selectedDetailProject;
                const tempId = taskIdVal || Date.now();
                const fileKey = `FILE:${projectCode}:TASK:${tempId}:${file}`;
                
                showToast("กำลังบันทึกไฟล์รายงานขึ้นคลาวด์...", "info");
                const { error: fileErr } = await supabaseClient.from('projects').upsert({
                    code: fileKey,
                    data: { fileUrl: result.dataUrl },
                    updated_at: new Date().toISOString()
                });
                if (fileErr) {
                    showToast(`อัปโหลดไฟล์ล้มเหลว: ${fileErr.message}`, "error");
                    return;
                }
                
                fileUrl = fileKey; // Store the reference key!
                hasNewFile = true;
            }
            
            const project = projectsData[appState.selectedDetailProject];
            if (project) {
                if (!project.tasks) project.tasks = [];
                
                if (taskIdVal) {
                    // EDIT MODE
                    const taskId = parseInt(taskIdVal);
                    const task = project.tasks.find(t => t.id === taskId);
                    if (task) {
                        task.title = title;
                        task.start = startStr;
                        task.end = endStr;
                        task.progress = progress;
                        if (hasNewFile) {
                            task.file = file;
                            task.fileUrl = fileUrl;
                        }
                        showToast(`แก้ไขรายการงานย่อยสำเร็จ!`, "success");
                    }
                } else {
                    // ADD MODE
                    const nextId = project.tasks.length > 0 ? Math.max(...project.tasks.map(t => t.id)) + 1 : 1;
                    project.tasks.push({ id: nextId, title, start: startStr, end: endStr, progress, file, fileUrl });
                    showToast(`เพิ่มรายการงาน: ${title} เรียบร้อยแล้ว!`, "success");
                }
                
                // Recalculate jobs & progress from tasks (single source of truth)
                recalculateJobsFromTasks(project);
                
                saveToLocalStorage();
                closeTaskModal();
                renderSubnavProjectWorkspace();
                renderOverallDashboard();
            }
        });
    }

    // 17. MODAL: Add Project Plan
    const planModal = document.getElementById("plan-modal");
    const openPlanBtn = document.getElementById("open-plan-modal-btn");
    const closePlanBtn = document.getElementById("close-plan-modal");
    const cancelPlanBtn = document.getElementById("cancel-plan-btn");
    const addPlanForm = document.getElementById("add-plan-form");

    const openPlanModal = () => {
        document.getElementById("plan-title-input").value = "";
        document.getElementById("plan-quarter-input").selectedIndex = 0;
        document.getElementById("plan-duration-input").selectedIndex = 0;
        document.getElementById("plan-color-input").selectedIndex = 0;
        if (planModal) planModal.classList.add("active");
    };

    const closePlanModal = () => {
        if (planModal) planModal.classList.remove("active");
    };

    // Use event delegation for dynamically bound elements if needed, but since it is statically in subtab header, we can bind directly
    // Wait, the subtab is rendered dynamically, which means the header is static but let's be safe. We can bind directly as the header is in the HTML.
    if (openPlanBtn) openPlanBtn.addEventListener("click", openPlanModal);
    
    // Just in case tab switching recreates the DOM or hides elements, we also bind a delegation listener on document:
    document.addEventListener("click", function(e) {
        if (e.target && e.target.id === "open-plan-modal-btn") {
            openPlanModal();
        }
    });

    if (closePlanBtn) closePlanBtn.addEventListener("click", closePlanModal);
    if (cancelPlanBtn) cancelPlanBtn.addEventListener("click", closePlanModal);

    if (addPlanForm) {
        addPlanForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const title = document.getElementById("plan-title-input").value.trim();
            const left = parseInt(document.getElementById("plan-quarter-input").value);
            const width = parseInt(document.getElementById("plan-duration-input").value);
            const color = document.getElementById("plan-color-input").value;
            
            const project = projectsData[appState.selectedDetailProject];
            if (project) {
                if (!project.plans) {
                    project.plans = [];
                }
                
                project.plans.push({ title, color, width, left });
                
                showToast(`เพิ่มแผนงาน: ${title} เรียบร้อยแล้ว!`, "success");
                closePlanModal();
                
                renderSubnavProjectWorkspace();
            }
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === uploadModal) closeUploadModal();
        if (e.target === expenseModal) closeExpenseModal();
        if (e.target === mediaModal) closeMediaModal();
        if (e.target === dailyReportModal) closeDailyReportModal();
        if (e.target === createProjectModal) closeCreateProjectModal();
        if (e.target === taskPdfModal) closeTaskPdfModal();
        if (e.target === taskModal) closeTaskModal();
        if (e.target === planModal) closePlanModal();
        if (e.target === planDocModal) closePlanDocModal();
    });

    // 18. MODAL: Add Plan Document
    const planDocModal = document.getElementById("plan-doc-modal");
    const closePlanDocBtn = document.getElementById("close-plan-doc-modal");
    const cancelPlanDocBtn = document.getElementById("cancel-plan-doc-btn");
    const addPlanDocForm = document.getElementById("add-plan-doc-form");

    const openPlanDocModal = () => {
        document.getElementById("plan-doc-title").value = "";
        document.getElementById("plan-doc-file").value = "";
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        document.getElementById("plan-doc-date").value = `${yyyy}-${mm}-${dd}`;
        if (planDocModal) planDocModal.classList.add("active");
    };

    const closePlanDocModal = () => {
        if (planDocModal) planDocModal.classList.remove("active");
    };

    if (closePlanDocBtn) closePlanDocBtn.addEventListener("click", closePlanDocModal);
    if (cancelPlanDocBtn) cancelPlanDocBtn.addEventListener("click", closePlanDocModal);

    document.addEventListener("click", function(e) {
        if (e.target && (e.target.id === "open-plan-doc-modal-btn" || e.target.closest("#open-plan-doc-modal-btn"))) {
            openPlanDocModal();
        }
    });

    if (addPlanDocForm) {
        addPlanDocForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const title = document.getElementById("plan-doc-title").value.trim();
            const fileInput = document.getElementById("plan-doc-file");
            const customDateVal = document.getElementById("plan-doc-date").value;
            
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
            
            const uploadedFile = fileInput.files[0];
            const file = uploadedFile.name;
            
            const result = await readFileAsBase64(uploadedFile);
            
            // Save file in separate row
            const projectCode = appState.selectedDetailProject;
            const fileKey = `FILE:${projectCode}:PLANDOC:${Date.now()}:${file}`;
            
            showToast("กำลังบันทึกหนังสือขอเข้างานขึ้นคลาวด์...", "info");
            const { error: fileErr } = await supabaseClient.from('projects').upsert({
                code: fileKey,
                data: { fileUrl: result.dataUrl },
                updated_at: new Date().toISOString()
            });
            if (fileErr) {
                showToast(`อัปโหลดไฟล์ล้มเหลว: ${fileErr.message}`, "error");
                return;
            }
            const fileUrl = fileKey; // Store reference key!
            
            let dateStr = "";
            if (customDateVal) {
                const [y, m, d] = customDateVal.split("-");
                dateStr = `${d}/${m}/${y}`;
            } else {
                const d = new Date();
                dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            }
            
            const project = projectsData[appState.selectedDetailProject];
            if (project) {
                if (!project.planDocs) {
                    project.planDocs = [];
                }
                
                project.planDocs.push({
                    title: title,
                    file: file,
                    fileUrl: fileUrl,
                    date: dateStr
                });
                
                // Save and sync immediately
                saveToLocalStorage();
                
                showToast(`อัปโหลดไฟล์แผนงาน: ${title} เรียบร้อยแล้ว!`, "success");
                closePlanDocModal();
                
                renderSubnavProjectWorkspace();
            }
        });
    }

    // --- INITIAL BOOTSTRAP RUN ---
    if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        populateSubnavHospitals();
        populateSubnavProjects("all");
        populateCostHospitals();
        populateCostProjects();
        renderOverallDashboard();
        renderSubnavProjectWorkspace();
        renderCostManagement();
    }

    // --- 19. PDF VIEWER MODAL ---
    const pdfViewerModal = document.getElementById("pdf-viewer-modal");
    const closePdfViewerBtn = document.getElementById("close-pdf-viewer-modal");
    const closePdfViewerBtn2 = document.getElementById("close-pdf-viewer-modal-2");
    const pdfEmbed = document.getElementById("pdf-viewer-embed");
    const pdfTitle = document.getElementById("pdf-viewer-title");
    const pdfDownloadBtn = document.getElementById("pdf-viewer-download-btn");

    window.resolveFileUrl = async function(fileUrl) {
        if (!fileUrl) return "";
        if (!fileUrl.startsWith("FILE:")) return fileUrl;
        
        // Check memory cache or local storage cache first
        window.fileCache = window.fileCache || {};
        if (window.fileCache[fileUrl]) return window.fileCache[fileUrl];
        const cached = localStorage.getItem(fileUrl);
        if (cached) return cached;
        
        // Load from Supabase
        if (typeof supabaseClient !== "undefined") {
            try {
                const { data, error } = await supabaseClient.from('projects').select('data').eq('code', fileUrl).single();
                if (error) throw error;
                if (data && data.data && data.data.fileUrl) {
                    const actualUrl = data.data.fileUrl;
                    window.fileCache[fileUrl] = actualUrl;
                    return actualUrl;
                }
            } catch (err) {
                console.error("resolveFileUrl error for key:", fileUrl, err);
            }
        }
        return "";
    };

    window.openPdfInNewTab = async function(fileUrl, fileName) {
        if (!fileUrl) {
            showToast("ไม่พบไฟล์ PDF สำหรับเปิดดู", "warning");
            return;
        }

        let actualUrl = fileUrl;
        if (fileUrl.startsWith("FILE:")) {
            showToast("กำลังดึงไฟล์ PDF...", "info");
            actualUrl = await window.resolveFileUrl(fileUrl);
            if (!actualUrl) {
                showToast("ไม่พบไฟล์ในระบบหรือดึงไฟล์ล้มเหลว", "error");
                return;
            }
        }

        try {
            // Direct download support for non-PDF/non-image base64 files (e.g. Excel)
            if (actualUrl.startsWith("data:")) {
                const mimeType = actualUrl.split(";")[0].split(":")[1] || "";
                if (mimeType !== "application/pdf" && !mimeType.startsWith("image/")) {
                    const downloadLink = document.createElement("a");
                    downloadLink.href = actualUrl;
                    downloadLink.download = fileName || "document";
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    showToast("เริ่มดาวน์โหลดไฟล์แล้ว", "success");
                    return;
                }
            }

            if (actualUrl.startsWith("data:application/pdf;base64,")) {
                const base64Clean = actualUrl.split(",")[1];
                const byteCharacters = atob(base64Clean);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            } else {
                window.open(actualUrl, '_blank');
            }
        } catch (e) {
            console.error("Failed to open PDF in new tab, falling back to iframe:", e);
            const win = window.open();
            if (win) {
                win.document.write(`<iframe src="${actualUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
            }
        }
    };

    window.openPdfViewer = async function(fileUrl, fileName, title) {
        if (!fileUrl) {
            showToast("ไม่พบไฟล์ PDF สำหรับดูตัวอย่าง (กรุณาอัปโหลดไฟล์จริงก่อน)", "warning");
            return;
        }
        
        let actualUrl = fileUrl;
        if (fileUrl.startsWith("FILE:")) {
            showToast("กำลังดึงไฟล์ PDF...", "info");
            actualUrl = await window.resolveFileUrl(fileUrl);
            if (!actualUrl) {
                showToast("ไม่พบไฟล์ในระบบหรือดึงไฟล์ล้มเหลว", "error");
                return;
            }
        }
        
        if (pdfTitle) pdfTitle.textContent = title || fileName || "ดูเอกสาร PDF";
        if (pdfEmbed) pdfEmbed.src = actualUrl;
        if (pdfDownloadBtn) {
            pdfDownloadBtn.href = actualUrl;
            pdfDownloadBtn.download = fileName || "document.pdf";
        }
        const fallbackLink = document.getElementById("pdf-viewer-download-link");
        if (fallbackLink) {
            fallbackLink.href = actualUrl;
            fallbackLink.download = fileName || "document.pdf";
        }
        if (pdfViewerModal) pdfViewerModal.classList.add("active");
    };

    window.downloadFileFromSupabase = async function(fileUrl, fileName) {
        if (!fileUrl) {
            showToast("ไม่พบไฟล์สำหรับดาวน์โหลด", "warning");
            return;
        }
        let actualUrl = fileUrl;
        if (fileUrl.startsWith("FILE:")) {
            showToast("กำลังดึงไฟล์เพื่อดาวน์โหลด...", "info");
            actualUrl = await window.resolveFileUrl(fileUrl);
            if (!actualUrl) {
                showToast("ไม่พบไฟล์ในระบบหรือดึงไฟล์ล้มเหลว", "error");
                return;
            }
        }
        try {
            const downloadLink = document.createElement("a");
            downloadLink.href = actualUrl;
            downloadLink.download = fileName || "document";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            showToast("เริ่มดาวน์โหลดไฟล์แล้ว", "success");
        } catch (e) {
            console.error("Download failed:", e);
            showToast("ดาวน์โหลดไฟล์ล้มเหลว", "error");
        }
    };

    // PDF Exporter for Daily Site Report
    window.exportDailyReportPDF = async function(dateStr, descText, imagesList, signaturesList) {
        showToast("กำลังจัดเตรียมเอกสาร PDF...", "info");
        
        try {
            const project = projectsData[appState.selectedDetailProject];
            if (!project) return;
            
            // 1. Fetch images base64 data URLs from Supabase
            const resolvedImages = [];
            for (const imgKey of (imagesList || [])) {
                if (imgKey.startsWith("FILE:")) {
                    const { data } = await supabaseClient.from('projects').select('data').eq('code', imgKey).single();
                    if (data && data.data && data.data.fileUrl) {
                        resolvedImages.push(data.data.fileUrl);
                    }
                } else {
                    resolvedImages.push(imgKey);
                }
            }
            
            // 2. Fetch signature images base64 data URLs from Supabase
            const resolvedSignatures = [];
            for (const sig of (signaturesList || [])) {
                let resolvedImg = "";
                if (sig.image && sig.image.startsWith("FILE:")) {
                    const { data } = await supabaseClient.from('projects').select('data').eq('code', sig.image).single();
                    if (data && data.data && data.data.fileUrl) {
                        resolvedImg = data.data.fileUrl;
                    }
                } else {
                    resolvedImg = sig.image;
                }
                resolvedSignatures.push({ name: sig.name, role: sig.role, image: resolvedImg });
            }
            
            // 3. Open print window and construct the printable page
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                showToast("ป๊อปอัปถูกบล็อกโดยเบราว์เซอร์ กรุณาอนุญาตป๊อปอัปเพื่อออก PDF", "error");
                return;
            }
            
            const imagesGridHTML = resolvedImages.map(src => `
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; height: 150px; display: flex; justify-content: center; align-items: center; background: #fafafa; width: 150px; margin: 5px;">
                    <img src="${src}" style="max-width: 100%; max-height: 100%; object-fit: cover;">
                </div>
            `).join("");
            
            const signaturesGridHTML = resolvedSignatures.map(sig => `
                <div style="text-align: center; width: 140px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; font-size: 11px;">
                    <img src="${sig.image}" style="max-width: 100px; max-height: 40px; object-fit: contain;">
                    <div style="font-size: 9px; color: #64748b; margin-top: 2px;">( ........................................ )</div>
                    <div style="font-weight: bold; color: #1e293b; margin-top: 2px;">${sig.name}</div>
                    <div style="font-size: 10px; color: #64748b;">${sig.role}</div>
                </div>
            `).join("");
            
            printWindow.document.write(`
                <html>
                <head>
                    <title>Daily Report - ${dateStr}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&display=swap" rel="stylesheet">
                    <style>
                        body {
                            font-family: 'Prompt', sans-serif;
                            color: #1e293b;
                            line-height: 1.6;
                            padding: 40px;
                            margin: 0;
                            background: #ffffff;
                        }
                        @media print {
                            body {
                                padding: 0 !important;
                                background: #fff !important;
                            }
                            .no-print {
                                display: none !important;
                            }
                            @page {
                                size: A4;
                                margin: 15mm;
                            }
                            .paper-container {
                                border: none !important;
                                box-shadow: none !important;
                                padding: 0 !important;
                                max-width: 100% !important;
                            }
                        }
                        @media screen {
                            body {
                                padding-top: 70px !important;
                                background: #64748b;
                            }
                            .paper-container {
                                width: 100%;
                                max-width: 700px;
                                background: #fff;
                                border: 1px solid #d1d5db;
                                border-radius: 6px;
                                padding: 40px;
                                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                                margin: 0 auto;
                            }
                        }
                    </style>
                </head>
                <body>
                    <!-- Floating print toolbar (Screen only) -->
                    <div class="no-print" style="position: fixed; top: 0; left: 0; right: 0; background: #1e293b; color: #fff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: 'Prompt', sans-serif;">
                        <span style="font-size: 14px; font-weight: 500;">ตัวอย่างรายงานการปฏิบัติงานรายวัน (Daily Report Preview)</span>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Prompt', sans-serif;">
                                <i class="fa-solid fa-print"></i> พิมพ์ / บันทึก PDF
                            </button>
                            <button onclick="window.close()" style="background: #475569; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; font-family: 'Prompt', sans-serif;">
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>

                    <div class="paper-container">
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
                        <div style="text-align: center; margin: 20px 0;">
                            <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; text-decoration: underline; margin: 0;">รายงานการปฏิบัติงานรายวัน (Daily Report)</h3>
                        </div>

                        <!-- 3. Details Grid -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
                            <div style="display: flex; gap: 8px; font-size: 12.5px;">
                                <span style="color: #475569; font-weight: 600; min-width: 60px;">วันที่:</span>
                                <span style="color: #0f172a; font-weight: 500;">${dateStr}</span>
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
                        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 20px;">
                            <span style="font-size: 12px; font-weight: 700; color: #0f172a; border-left: 3px solid #1e3a8a; padding-left: 8px;">รายละเอียดการปฏิบัติงานประจำวัน</span>
                            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; font-size: 12.5px; color: #334155; line-height: 1.6; white-space: pre-wrap; min-height: 120px;">${descText}</div>
                        </div>

                        <!-- 5. Photo Gallery -->
                        ${resolvedImages.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 20px;">
                                <span style="font-size: 12px; font-weight: 700; color: #0f172a; border-left: 3px solid #1e3a8a; padding-left: 8px;">รูปภาพการปฏิบัติงาน</span>
                                <div style="display: flex; gap: 10px; flex-wrap: wrap; background: #fafafa; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 6px; justify-content: center;">
                                    ${imagesGridHTML}
                                </div>
                            </div>
                        ` : ""}

                        <!-- 6. Signatures -->
                        ${resolvedSignatures.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 16px; page-break-inside: avoid;">
                                <span style="font-size: 12px; font-weight: 700; color: #0f172a; border-left: 3px solid #1e3a8a; padding-left: 8px;">ผู้รับรองการปฏิบัติงาน</span>
                                <div style="display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; margin-top: 6px;">
                                    ${signaturesGridHTML}
                                </div>
                            </div>
                        ` : ""}
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            showToast("จัดเตรียมเอกสาร PDF สำเร็จ", "success");
        } catch (err) {
            console.error("Failed to export PDF:", err);
            showToast("ส่งออก PDF ล้มเหลว: " + err.message, "error");
        }
    };

    // --- EXPORT PROJECT PDF REPORT SYSTEM ---
    window.exportProjectPDF = async function(projectCode) {
        const code = projectCode || appState.selectedDetailProject;
        if (!code) {
            showToast("กรุณาเลือกโครงการที่ต้องการส่งออก PDF", "warning");
            return;
        }

        showToast("กำลังจัดเตรียมข้อมูลและรูปภาพสำหรับเอกสาร PDF...", "info");

        const isCustomer = (appState.currentRole === "customer" || appState.currentRole === "technician" || appState.currentRole === "tech");
        const scurveCanvas = document.getElementById("scurve-chart-canvas");
        const scurveChartImg = scurveCanvas ? scurveCanvas.toDataURL("image/png") : null;

        const now = new Date();
        const dateStr = now.toLocaleDateString("th-TH", { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });

        let projectsToExport = [];
        const isAllView = (code === "all");

        if (isAllView) {
            const hospitalVal = document.getElementById("subnav-hospital-selector") ? document.getElementById("subnav-hospital-selector").value : "all";
            const yearVal = document.getElementById("subnav-year-filter") ? document.getElementById("subnav-year-filter").value : "all";
            projectsToExport = Object.values(projectsData).filter(p => {
                const hMatch = hospitalVal === "all" || p.customer === hospitalVal;
                const yMatch = yearVal === "all" || p.year === parseInt(yearVal);
                return hMatch && yMatch;
            });
        } else {
            const proj = projectsData[code];
            if (proj) projectsToExport = [proj];
        }

        // Sync S-curve months with Gantt dates for all exported projects
        projectsToExport.forEach(p => {
            if (typeof syncScurveMonthsWithGantt === "function") {
                syncScurveMonthsWithGantt(p);
            }
        });

        if (projectsToExport.length === 0) {
            showToast("ไม่พบข้อมูลโครงการสำหรับสร้างเอกสาร PDF", "error");
            return;
        }

        // Helper to resolve Supabase or Base64 images
        async function resolveImgSrc(imgRef) {
            if (!imgRef) return null;
            if (typeof imgRef === "string" && imgRef.startsWith("FILE:")) {
                try {
                    if (typeof supabaseClient !== "undefined") {
                        const { data } = await supabaseClient.from('projects').select('data').eq('code', imgRef).single();
                        if (data && data.data && data.data.fileUrl) return data.data.fileUrl;
                    }
                } catch (e) {
                    console.warn("Supabase image fetch failed:", e);
                }
                return null;
            }
            return imgRef;
        }

        try {
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                showToast("เบราว์เซอร์บล็อกป๊อปอัป กรุณาอนุญาตป๊อปอัปแล้วลองอีกครั้ง", "error");
                return;
            }

            let projectsHTML = "";
            for (let idx = 0; idx < projectsToExport.length; idx++) {
                const proj = projectsToExport[idx];

                // Build Gantt Chart HTML for Plan Work (Gantt Chart Scheduler style - like Screenshot 1)
                let ganttChartHTML = "";
                if (proj.ganttData && proj.ganttData.tasks && proj.ganttData.tasks.length > 0 && proj.ganttData.startDate && proj.ganttData.endDate) {
                    const dateList = [];
                    const [sy, sm, sd] = proj.ganttData.startDate.split('-').map(Number);
                    const [ey, em, ed] = proj.ganttData.endDate.split('-').map(Number);
                    const start = new Date(sy, sm - 1, sd);
                    const end = new Date(ey, em - 1, ed);

                    let current = new Date(start);
                    let count = 0;
                    while (current <= end && count < 100) {
                        dateList.push(new Date(current));
                        current.setDate(current.getDate() + 1);
                        count++;
                    }

                    if (dateList.length > 0) {
                        const monthGroups = [];
                        const monthThaiNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
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

                        let rowsHtml = "";
                        proj.ganttData.tasks.forEach(task => {
                            if (!task.rowType) {
                                task.rowType = task.isHeader ? 'phase' : 'task';
                            }

                            if (task.rowType === 'phase') {
                                rowsHtml += `
                                    <tr style="background: #e2e8f0; font-weight: bold;">
                                        <td style="text-align: center; border: 1px solid #cbd5e1; font-size: 10px;">${task.itemNum || ''}</td>
                                        <td colspan="${dateList.length + 1}" style="font-weight: bold; border: 1px solid #cbd5e1; text-align: left; padding: 4px; font-size: 10px;">${task.name || ''}</td>
                                    </tr>
                                `;
                            } else if (task.rowType === 'type') {
                                rowsHtml += `
                                    <tr style="background: #eff6ff; font-weight: bold; color: #1e40af;">
                                        <td style="text-align: center; border: 1px solid #cbd5e1; font-size: 10px; color: #1e40af;">${task.itemNum || ''}</td>
                                        <td colspan="${dateList.length + 1}" style="font-weight: bold; border: 1px solid #cbd5e1; text-align: left; padding: 4px; font-size: 10px; color: #1e40af;">${task.name || ''}</td>
                                    </tr>
                                `;
                            } else if (task.rowType === 'category') {
                                rowsHtml += `
                                    <tr style="background: #ffffff; font-weight: bold;">
                                        <td style="text-align: center; border: 1px solid #cbd5e1; font-size: 10px;">${task.itemNum || ''}</td>
                                        <td colspan="${dateList.length + 1}" style="font-weight: bold; border: 1px solid #cbd5e1; text-align: left; padding: 4px; font-size: 10px; text-decoration: underline;">${task.name || ''}</td>
                                    </tr>
                                `;
                            } else {
                                const indentStyle = task.isSubtask ? "padding-left: 15px;" : "";
                                const prefix = task.isSubtask ? "- " : "";
                                let gridCellsHtml = "";
                                dateList.forEach(d => {
                                    const dStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
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
                                    if (noise === 1) cellBg = "background-color: #fcd34d !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;";
                                    else if (noise === 2) cellBg = "background-color: #22c55e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;";
                                    else if (noise === 3) cellBg = "background-color: #f87171 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;";
                                    
                                    let triangleHtml = "";
                                    if (shift === 'day') {
                                        triangleHtml = `<div style="position: absolute; top: 0; left: 0; width: 0; height: 0; border-top: 11px solid #f97316 !important; border-right: 11px solid transparent !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; pointer-events: none;"></div>`;
                                    } else if (shift === 'night') {
                                        triangleHtml = `<div style="position: absolute; top: 0; left: 0; width: 0; height: 0; border-top: 11px solid #000000 !important; border-right: 11px solid transparent !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; pointer-events: none;"></div>`;
                                    }

                                    gridCellsHtml += `<td style="position: relative; border: 1px solid #cbd5e1; width: 18px; ${cellBg}">${triangleHtml}</td>`;
                                });

                                rowsHtml += `
                                    <tr>
                                        <td style="text-align: center; border: 1px solid #cbd5e1; font-size: 9.5px;">${task.itemNum || ''}</td>
                                        <td style="border: 1px solid #cbd5e1; padding: 4px; text-align: left; font-size: 9.5px; ${indentStyle}">${prefix}${task.name || ''}</td>
                                        ${gridCellsHtml}
                                    </tr>
                                `;
                            }
                        });

                        let monthsHeaderHtml = "";
                        monthGroups.forEach(grp => {
                            monthsHeaderHtml += `<th colspan="${grp.colspan}" style="border: 1px solid #cbd5e1; padding: 5px; font-size: 9.5px; background: #e2e8f0; font-weight: bold;">${grp.name}</th>`;
                        });

                        let daysHeaderHtml = "";
                        dateList.forEach(d => {
                            daysHeaderHtml += `<th style="border: 1px solid #cbd5e1; font-size: 8px; font-weight: normal; width: 18px; padding: 2px; background: #f1f5f9;">${d.getDate()}</th>`;
                        });

                        ganttChartHTML = `
                            <div class="section-title"><i class="fa-solid fa-calendar-days"></i> แผนงานการดำเนินงานโครงการ (Plan Work Schedule - Gantt Chart)</div>
                            <div style="overflow-x: auto; max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 24px;">
                                <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
                                    <thead>
                                        <tr>
                                            <th rowspan="2" style="width: 50px; border: 1px solid #cbd5e1; background: #e2e8f0; font-size: 9.5px; padding: 5px;">Items</th>
                                            <th rowspan="2" style="border: 1px solid #cbd5e1; background: #e2e8f0; font-size: 9.5px; padding: 5px; text-align: left;">Description</th>
                                            ${monthsHeaderHtml}
                                        </tr>
                                        <tr>
                                            ${daysHeaderHtml}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rowsHtml}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }
                }

                // Build S-Curve (Actual Progress - S-Curve chart image + S-curve progress table - like Screenshot 2)
                let scurveActualHTML = "";
                let scurveChartHTML = "";

                if (scurveChartImg) {
                    scurveChartHTML = `
                        <div class="section-title"><i class="fa-solid fa-chart-line"></i> กราฟความคืบหน้าโครงการสะสม (S-Curve Chart)</div>
                        <div style="text-align: center; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: center; align-items: center;">
                            <img src="${scurveChartImg}" style="max-width: 100%; max-height: 280px; object-fit: contain;">
                        </div>
                    `;
                }

                if (proj.scurveData && proj.scurveData.length > 0 && proj.scurveMonths) {
                    const hideActualCumRow = true;
                    let totalWeight = proj.scurveData.reduce((sum, item) => sum + (item.isSubtask ? 0 : parseFloat(item.weight) || 0), 0);
                    let headerCols = proj.scurveMonths.map(month => `
                        <th colspan="4" style="border-left: 1px solid #cbd5e1; text-align: center; padding: 6px;">${month}</th>
                    `).join("");
                    let weekCols = proj.scurveMonths.map(() => `
                        <th style="border-left: 1px solid #cbd5e1; font-weight: normal; font-size: 10px; padding: 4px;">1</th>
                        <th style="font-weight: normal; font-size: 10px; padding: 4px;">2</th>
                        <th style="font-weight: normal; font-size: 10px; padding: 4px;">3</th>
                        <th style="font-weight: normal; font-size: 10px; padding: 4px;">4</th>
                    `).join("");
                    
                    let rows = proj.scurveData.map(item => {
                        const isSub = item.isSubtask;
                        let cells = (item.actual || []).map((val, i) => `
                            <td style="border-left: ${i%4===0 ? '1px solid #cbd5e1' : 'none'}; text-align: center; font-size: 10.5px; padding: 4px;">${val || '-'}</td>
                        `).join("");
                        return `
                            <tr>
                                <td style="text-align: center;">${isSub ? '' : (item.item || '')}</td>
                                <td style="padding-left: ${isSub ? '20px' : '8px'}; font-weight: ${isSub ? 'normal' : '600'};">${isSub ? '- ' : ''}${item.name || ''}</td>
                                ${isCustomer ? '' : `<td style="text-align: center;">${isSub ? '' : formatNumber(item.budget || 0)}</td>`}
                                <td style="text-align: center;">${isSub ? '' : (item.weight || 0) + '%'}</td>
                                <td style="text-align: center; font-weight: bold;">${isSub ? '' : (item.actual && item.actual.length > 0 ? item.actual.reduce((sum, v) => sum + (parseFloat(v) || 0), 0) : 0).toFixed(1) + '%'}</td>
                                ${cells}
                            </tr>
                        `;
                    }).join("");
                    
                    // Calc weekly sums for actual
                    let weeklyActualSums = new Array(proj.scurveMonths.length * 4).fill(0);
                    let currentParentWeightValAct = 0;
                    let lastActualIndexValAct = -1;
                    proj.scurveData.forEach(item => {
                        if (!item.isSubtask) {
                            currentParentWeightValAct = parseFloat(item.weight) || 0;
                        }
                        for (let i = 0; i < weeklyActualSums.length; i++) {
                            let hasActualData = (item.actual && item.actual[i] !== undefined && item.actual[i] !== null && item.actual[i] !== '' && item.actual[i] !== '-' && !isNaN(parseFloat(item.actual[i])) && parseFloat(item.actual[i]) > 0);
                            let aVal = hasActualData ? (parseFloat(item.actual[i]) || 0) : 0;
                            weeklyActualSums[i] += (currentParentWeightValAct * aVal / 100);

                            if (hasActualData && i > lastActualIndexValAct) {
                                lastActualIndexValAct = i;
                            }
                        }
                    });
                    
                    let weeklySumsCells = weeklyActualSums.map((val, i) => {
                        const cellText = (i <= lastActualIndexValAct) ? (val === 0 ? '0.0%' : val.toFixed(1) + '%') : '';
                        return `<td style="border-left: ${i%4===0 ? '1px solid #cbd5e1' : 'none'}; text-align: center; font-size: 10px; font-weight: bold;">${cellText}</td>`;
                    }).join("");
                    
                    let actualCum = 0;
                    let weeklyCumCells = weeklyActualSums.map((val, i) => {
                        actualCum += val;
                        return `<td style="border-left: ${i%4===0 ? '1px solid #cbd5e1' : 'none'}; text-align: center; font-size: 10px; font-weight: bold; color: #10b981;">${actualCum === 0 ? '0.0%' : actualCum.toFixed(1) + '%'}</td>`;
                    }).join("");

                    let planCumCells = "";
                    if (proj.scurvePlanCum) {
                        planCumCells = proj.scurvePlanCum.map((val, i) => `
                            <td style="border-left: ${i%4===0 ? '1px solid #cbd5e1' : 'none'}; text-align: center; font-size: 10px; font-weight: bold; color: #1e40af;">${val === 0 ? '0.0%' : val.toFixed(1) + '%'}</td>
                        `).join("");
                    } else {
                        planCumCells = new Array(proj.scurveMonths.length * 4).fill('<td style="text-align: center; font-size: 10px; font-weight: bold; color: #1e40af;">0.0%</td>').map((td, i) => i%4===0 ? td.replace("td style=\"", "td style=\"border-left: 1px solid #cbd5e1; ") : td).join("");
                    }

                    scurveActualHTML = `
                        <div class="section-title"><i class="fa-solid fa-bars-progress"></i> ผลงานการดำเนินงานจริง (Actual Progress Schedule)</div>
                        <table class="data-table scurve-table" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                            <thead>
                                <tr style="background: #e0e7ff; text-align: center;">
                                    <th rowspan="2" style="width: 50px;">Items</th>
                                    <th rowspan="2">Description</th>
                                    ${isCustomer ? '' : '<th rowspan="2" style="width: 80px;">Budget</th>'}
                                    <th rowspan="2" style="width: 60px;">%</th>
                                    <th rowspan="2" style="width: 60px;">% (รวม)</th>
                                    ${headerCols}
                                </tr>
                                <tr style="background: #f1f5f9; text-align: center;">
                                    ${weekCols}
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                                <tr style="background: #f8fafc; font-weight: bold; border-top: 2px solid #cbd5e1;">
                                    <td colspan="2" style="text-align: right; padding: 6px 10px;">รวม</td>
                                    ${isCustomer ? '' : `<td style="text-align: center;">${formatNumber(proj.scurveData.reduce((sum, item)=>sum+(item.isSubtask?0:item.budget||0),0))}</td>`}
                                    <td style="text-align: center;">${totalWeight.toFixed(1)}%</td>
                                    <td></td>
                                    ${new Array(proj.scurveMonths.length * 4).fill('<td style="border-left: 1px solid #cbd5e1;"></td>').map((td, i) => i%4===0 ? td : '<td></td>').join("")}
                                </tr>
                                <tr style="background: #fff; font-weight: bold; border-top: 1px solid #cbd5e1;">
                                    <td colspan="${isCustomer ? 4 : 5}" style="text-align: right; padding: 6px 10px; font-size: 11px;">ปริมาณงานต่อสัปดาห์ (%)</td>
                                    ${weeklySumsCells}
                                </tr>
                                ${hideActualCumRow ? '' : `
                                <tr style="background: #f1f5f9; font-weight: bold; border-top: 1px solid #cbd5e1;">
                                    <td colspan="${isCustomer ? 4 : 5}" style="text-align: right; padding: 6px 10px; font-size: 11px;">สะสมปริมาณงาน (%)</td>
                                    ${weeklyCumCells}
                                </tr>
                                `}
                                <tr style="background: #eef2f6; font-weight: bold; border-top: 1px solid #cbd5e1;">
                                    <td colspan="${isCustomer ? 4 : 5}" style="text-align: right; padding: 6px 10px; font-size: 11px; color: #1e40af;">เป้าหมายแผนงาน</td>
                                    ${planCumCells}
                                </tr>
                            </tbody>
                        </table>
                    `;
                }

                // Financial details (hidden for customer role)
                const finHTML = isCustomer ? "" : `
                    <div class="financial-grid">
                        <div class="fin-box">
                            <span class="fin-label">มูลค่าสัญญา</span>
                            <strong class="fin-val">${formatNumber(proj.value)} บาท</strong>
                        </div>
                        <div class="fin-box">
                            <span class="fin-label">ต้นทุนประมาณการ</span>
                            <strong class="fin-val">${formatNumber(proj.cost)} บาท</strong>
                        </div>
                        <div class="fin-box">
                            <span class="fin-label">กำไรขั้นต้น</span>
                            <strong class="fin-val text-green">${formatNumber(proj.profit)} บาท</strong>
                        </div>
                    </div>
                `;

                // Project Description / Scope Box
                let descHTML = "";
                if (proj.description) {
                    descHTML = `
                        <div class="section-title"><i class="fa-solid fa-align-left"></i> รายละเอียดขอบเขตงานโครงการ (Project Description & Scope)</div>
                        <div class="desc-box">${proj.description}</div>
                    `;
                }

                // Tasks List Table
                let tasksHTML = "";
                if (proj.tasks && proj.tasks.length > 0) {
                    let rows = proj.tasks.map((t, i) => `
                        <tr>
                            <td style="text-align: center;">${i + 1}</td>
                            <td><strong>${t.title}</strong></td>
                            <td style="text-align: center;">${t.start || '-'}</td>
                            <td style="text-align: center;">${t.end || '-'}</td>
                            <td style="text-align: center; font-weight: 700; color: #059669;">${t.progress || 0}%</td>
                            <td style="text-align: center;">${t.status || 'กำลังดำเนินการ'}</td>
                        </tr>
                    `).join("");

                    tasksHTML = `
                        <div class="section-title"><i class="fa-solid fa-list-check"></i> รายการแผนงานย่อย (Work Breakdown Tasks)</div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 40px; text-align: center;">#</th>
                                    <th>ชื่อหมวดงาน / กิจกรรม</th>
                                    <th style="width: 100px; text-align: center;">เริ่มต้น</th>
                                    <th style="width: 100px; text-align: center;">สิ้นสุด</th>
                                    <th style="width: 80px; text-align: center;">ความคืบหน้า</th>
                                    <th style="width: 110px; text-align: center;">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;
                }

                // Daily Reports Summary (fixing dr.desc property so no undefined)
                let dailyReportsHTML = "";
                if (proj.dailyReports && proj.dailyReports.length > 0) {
                    let rows = proj.dailyReports.map((dr, i) => `
                        <tr>
                            <td style="text-align: center;">${i + 1}</td>
                            <td style="text-align: center;">${dr.date || '-'}</td>
                            <td>${dr.desc || dr.description || dr.detail || '-'}</td>
                            <td style="text-align: center;">${dr.reporter || dr.author || 'ทีมวิศวกร'}</td>
                        </tr>
                    `).join("");

                    dailyReportsHTML = `
                        <div class="section-title"><i class="fa-solid fa-file-signature"></i> สรุปรายงานการปฏิบัติงานประจำวัน (Daily Site Reports)</div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 40px; text-align: center;">#</th>
                                    <th style="width: 100px; text-align: center;">วันที่</th>
                                    <th>รายละเอียดการทำงานหน้างาน</th>
                                    <th style="width: 120px; text-align: center;">ผู้รายงาน</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;
                }

                // Expenses Table (Hidden for customer)
                let expensesHTML = "";
                if (!isCustomer && proj.expenses && proj.expenses.length > 0) {
                    let rows = proj.expenses.map((exp, i) => `
                        <tr>
                            <td style="text-align: center;">${i + 1}</td>
                            <td style="text-align: center;">${exp.date || '-'}</td>
                            <td><strong>${exp.title}</strong></td>
                            <td style="text-align: center;">${exp.type || 'ค่าใช้จ่ายทั่วไป'}</td>
                            <td style="text-align: right; font-weight: 700; color: #0f172a;">${formatNumber(exp.amount || 0)} บาท</td>
                        </tr>
                    `).join("");

                    expensesHTML = `
                        <div class="section-title"><i class="fa-solid fa-receipt"></i> สรุปรายการค่าใช้จ่ายโครงการ (Project Expenses)</div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 40px; text-align: center;">#</th>
                                    <th style="width: 100px; text-align: center;">วันที่</th>
                                    <th>รายการค่าใช้จ่าย</th>
                                    <th style="width: 120px; text-align: center;">หมวดหมู่</th>
                                    <th style="width: 130px; text-align: right;">จำนวนเงิน</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;
                }

                // Documents Table
                let documentsHTML = "";
                if (proj.documents && proj.documents.length > 0) {
                    let rows = proj.documents.map((doc, i) => `
                        <tr>
                            <td style="text-align: center;">${i + 1}</td>
                            <td><strong>${doc.name}</strong></td>
                            <td style="text-align: center;">${doc.type || 'เอกสารทั่วไป'}</td>
                            <td style="text-align: center;">${doc.date || '-'}</td>
                        </tr>
                    `).join("");

                    documentsHTML = `
                        <div class="section-title"><i class="fa-solid fa-folder-closed"></i> รายการเอกสารโครงการ (Project Documents)</div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 40px; text-align: center;">#</th>
                                    <th>ชื่อไฟล์เอกสาร</th>
                                    <th style="width: 120px; text-align: center;">ประเภท</th>
                                    <th style="width: 100px; text-align: center;">วันที่อัปโหลด</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;
                }

                // Gather and resolve all photos (from proj.media and dailyReports)
                let photoList = [];
                if (proj.media && proj.media.length > 0) {
                    for (const item of proj.media) {
                        const rawRef = item.img || item.fileUrl || item.dataUrl || item.file || item.url;
                        const src = await resolveImgSrc(rawRef);
                        if (src) {
                            photoList.push({ src: src, title: item.title || 'รูปภาพโครงการ', date: item.date || '' });
                        }
                    }
                }
                if (proj.dailyReports && proj.dailyReports.length > 0) {
                    for (const dr of proj.dailyReports) {
                        if (dr.images && dr.images.length > 0) {
                            for (const imgKey of dr.images) {
                                const src = await resolveImgSrc(imgKey);
                                if (src) {
                                    photoList.push({ src: src, title: `ภาพงานวันที่ ${dr.date}`, date: dr.date });
                                }
                            }
                        }
                    }
                }

                let galleryHTML = "";
                if (photoList.length > 0) {
                    const cards = photoList.map(p => `
                        <div class="photo-card">
                            <img src="${p.src}" alt="${p.title}" class="photo-img">
                            <div class="photo-caption">${p.title} ${p.date ? `(${p.date})` : ''}</div>
                        </div>
                    `).join("");

                    galleryHTML = `
                        <div class="section-title"><i class="fa-solid fa-images"></i> รูปภาพความก้าวหน้าและภาพถ่ายหน้างาน (Work Progress & Site Photos)</div>
                        <div class="photo-grid">
                            ${cards}
                        </div>
                    `;
                }

                projectsHTML += `
                    <div class="project-page ${idx > 0 ? 'page-break' : ''}">
                        <!-- Company Header -->
                        <div class="company-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #334155; padding-bottom: 12px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <img src="logo.png" style="height: 55px; width: auto; object-fit: contain;" alt="TW Logo">
                                <div style="display: flex; flex-direction: column; text-align: left;">
                                    <span style="font-size: 16px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.4px;">TECHNICAL WATER CO., LTD.</span>
                                    <span style="font-size: 11.5px; font-weight: 700; color: #334155;">บริษัท เทคนิคอล วอเตอร์ จำกัด</span>
                                </div>
                            </div>
                            <div style="text-align: right; font-size: 9.5px; color: #475569; line-height: 1.4; max-width: 420px;">
                                <div>301/856 ซอยรามคำแหง 68 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240</div>
                                <div>เบอร์โทร (Tel.) 02-735-3022 | E-mail: technicalwater2015@gmail.com</div>
                                <div style="font-size: 9px; font-weight: 700; color: #0284c7; margin-top: 2px;">วันที่พิมพ์: ${dateStr} ${timeStr} น.</div>
                            </div>
                        </div>

                        <!-- Report Title Banner -->
                        <div class="title-banner">
                            <h2>รายงานสรุปข้อมูลโครงการ (${proj.code})</h2>
                        </div>

                        <!-- Project Info Box -->
                        <div class="info-grid">
                            <div class="info-cell">
                                <span class="info-lbl">รหัสโครงการ:</span>
                                <strong class="info-val">${proj.code}</strong>
                            </div>
                            <div class="info-cell">
                                <span class="info-lbl">ปีงบประมาณ:</span>
                                <strong class="info-val">ปี ${proj.year}</strong>
                            </div>
                            <div class="info-cell span-2">
                                <span class="info-lbl">ชื่อโครงการ:</span>
                                <strong class="info-val">${proj.name}</strong>
                            </div>
                            <div class="info-cell span-2">
                                <span class="info-lbl">โรงพยาบาล / ลูกค้า:</span>
                                <strong class="info-val">${proj.customer}</strong>
                            </div>
                            <div class="info-cell">
                                <span class="info-lbl">ผู้ดูแลโครงการ (PM):</span>
                                <strong class="info-val">${proj.manager || 'วิศวกรโครงการอาวุโส (PM Team)'}</strong>
                            </div>
                            <div class="info-cell">
                                <span class="info-lbl">ระยะเวลาสัญญา:</span>
                                <strong class="info-val">${proj.start || '-'} ถึง ${proj.end || '-'}</strong>
                            </div>
                            <div class="info-cell span-2">
                                <span class="info-lbl">สถานะโครงการ:</span>
                                <strong class="info-val status-badge">${proj.status || 'งานที่กำลังดำเนินการ'}</strong>
                            </div>
                        </div>

                        <!-- Progress Section -->
                        <div class="progress-box">
                            <div class="progress-header">
                                <span>ความก้าวหน้าโครงการจริง (Actual Progress):</span>
                                <strong class="progress-num">${proj.progress || 0}%</strong>
                            </div>
                            <div class="progress-track">
                                <div class="progress-fill" style="width: ${proj.progress || 0}%;"></div>
                            </div>
                        </div>

                        ${ganttChartHTML}
                        ${scurveChartHTML}
                        ${scurveActualHTML}
                        ${finHTML}
                        ${descHTML}
                        ${tasksHTML}
                        ${dailyReportsHTML}
                        ${expensesHTML}
                        ${documentsHTML}
                        ${galleryHTML}

                        <!-- Official Signatures Box -->
                        <div class="signatures-box">
                            <div class="sig-column">
                                <div class="sig-line"></div>
                                <p class="sig-name">( ${proj.manager || 'วิศวกรผู้ควบคุมงาน'} )</p>
                                <p class="sig-title">ผู้รายงาน / วิศวกรโครงการ</p>
                            </div>
                            <div class="sig-column">
                                <div class="sig-line"></div>
                                <p class="sig-name">( คุณ Project Manager )</p>
                                <p class="sig-title">ผู้จัดการโครงการ (Project Manager)</p>
                            </div>
                            <div class="sig-column">
                                <div class="sig-line"></div>
                                <p class="sig-name">( ตัวแทนโรงพยาบาล )</p>
                                <p class="sig-title">ผู้รับมอบงาน / คณะกรรมการตรวจรับ</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="th">
                <head>
                    <meta charset="UTF-8">
                    <title>Project Report - ${code}</title>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
                        body {
                            font-family: 'Sarabun', sans-serif;
                            color: #1e293b;
                            margin: 0;
                            padding: 24px;
                            background: #fff;
                            font-size: 13px;
                            line-height: 1.5;
                        }
                        .project-page {
                            max-width: 800px;
                            margin: 0 auto 30px auto;
                        }
                        .page-break {
                            page-break-before: always;
                        }
                        .company-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 2px solid #0284c7;
                            padding-bottom: 12px;
                            margin-bottom: 16px;
                        }
                        .company-title {
                            font-size: 16px;
                            font-weight: 700;
                            color: #0f172a;
                            margin: 0;
                        }
                        .company-sub {
                            font-size: 11px;
                            color: #64748b;
                            margin: 2px 0 0 0;
                        }
                        .report-badge {
                            background: #0284c7;
                            color: #fff;
                            font-size: 10px;
                            font-weight: 700;
                            padding: 3px 10px;
                            border-radius: 4px;
                            text-align: right;
                            display: inline-block;
                        }
                        .report-date {
                            font-size: 10px;
                            color: #64748b;
                            margin-top: 4px;
                        }
                        .title-banner {
                            background: #f1f5f9;
                            border-left: 4px solid #0284c7;
                            padding: 10px 14px;
                            margin-bottom: 16px;
                        }
                        .title-banner h2 {
                            font-size: 16px;
                            font-weight: 700;
                            margin: 0;
                            color: #0f172a;
                        }
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 8px 16px;
                            background: #fafafa;
                            border: 1px solid #e2e8f0;
                            border-radius: 6px;
                            padding: 14px;
                            margin-bottom: 16px;
                        }
                        .info-cell {
                            font-size: 12px;
                        }
                        .info-cell.span-2 {
                            grid-column: span 2;
                        }
                        .info-lbl {
                            color: #64748b;
                            margin-right: 6px;
                        }
                        .info-val {
                            color: #0f172a;
                        }
                        .status-badge {
                            background: #dcfce7;
                            color: #15803d;
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-size: 11px;
                        }
                        .progress-box {
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 6px;
                            padding: 12px 14px;
                            margin-bottom: 16px;
                        }
                        .progress-header {
                            display: flex;
                            justify-content: space-between;
                            font-size: 12px;
                            margin-bottom: 6px;
                        }
                        .progress-num {
                            color: #059669;
                            font-size: 14px;
                        }
                        .progress-track {
                            height: 10px;
                            background: #e2e8f0;
                            border-radius: 5px;
                            overflow: hidden;
                        }
                        .progress-fill {
                            height: 100%;
                            background: linear-gradient(90deg, #10b981, #059669);
                            border-radius: 5px;
                        }
                        .financial-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr 1fr;
                            gap: 10px;
                            margin-bottom: 16px;
                        }
                        .fin-box {
                            background: #f1f5f9;
                            border: 1px solid #cbd5e1;
                            padding: 10px;
                            border-radius: 6px;
                            text-align: center;
                        }
                        .fin-label {
                            display: block;
                            font-size: 10.5px;
                            color: #64748b;
                        }
                        .fin-val {
                            font-size: 14px;
                            color: #0f172a;
                        }
                        .desc-box {
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 6px;
                            padding: 12px;
                            font-size: 12px;
                            color: #334155;
                            margin-bottom: 16px;
                            white-space: pre-wrap;
                        }
                        .text-green { color: #059669 !important; }
                        .section-title {
                            font-size: 13px;
                            font-weight: 700;
                            color: #0f172a;
                            margin: 16px 0 8px 0;
                            border-bottom: 1px solid #e2e8f0;
                            padding-bottom: 4px;
                        }
                        .data-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                            font-size: 11.5px;
                        }
                        .data-table th, .data-table td {
                            border: 1px solid #cbd5e1;
                            padding: 6px 8px;
                        }
                        .data-table th {
                            background: #f1f5f9;
                            font-weight: 600;
                            color: #334155;
                        }
                        .photo-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 12px;
                            margin-bottom: 16px;
                            page-break-inside: avoid;
                        }
                        .photo-card {
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 6px;
                            padding: 8px;
                            text-align: center;
                        }
                        .photo-img {
                            width: 100%;
                            height: 180px;
                            object-fit: cover;
                            border-radius: 4px;
                            border: 1px solid #cbd5e1;
                        }
                        .photo-caption {
                            font-size: 10.5px;
                            font-weight: 600;
                            color: #334155;
                            margin-top: 6px;
                        }
                        .signatures-box {
                            display: grid;
                            grid-template-columns: 1fr 1fr 1fr;
                            gap: 20px;
                            margin-top: 36px;
                            padding-top: 20px;
                            border-top: 1px dashed #cbd5e1;
                            page-break-inside: avoid;
                        }
                        .sig-column {
                            text-align: center;
                        }
                        .sig-line {
                            border-bottom: 1px solid #94a3b8;
                            height: 40px;
                            margin-bottom: 8px;
                        }
                        .sig-name {
                            font-size: 11px;
                            font-weight: 600;
                            margin: 0;
                        }
                        .sig-title {
                            font-size: 10px;
                            color: #64748b;
                            margin: 2px 0 0 0;
                        }
                        @media print {
                            body { padding: 0; }
                            .project-page { max-width: 100%; }
                            .no-print { display: none !important; }
                        }
                        @media screen {
                            body { padding-top: 70px !important; }
                        }
                    </style>
                </head>
                <body>
                    <!-- Floating print toolbar (Screen only) -->
                    <div class="no-print" style="position: fixed; top: 0; left: 0; right: 0; background: #1e293b; color: #fff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: 'Sarabun', sans-serif;">
                        <span style="font-size: 14px; font-weight: 500;">ตัวอย่างรายงานโครงการ (Project Report Preview)</span>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <i class="fa-solid fa-print"></i> พิมพ์ / บันทึก PDF
                            </button>
                            <button onclick="window.close()" style="background: #475569; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer;">
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>

                    ${projectsHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
            showToast("เปิดตัวอย่างรายงานโครงการสำเร็จ", "success");
        } catch (e) {
            console.error("Export Project PDF failed:", e);
            showToast("ส่งออก PDF ล้มเหลว: " + e.message, "error");
        }
    };

    const exportProjPdfBtn = document.getElementById("export-project-pdf-btn");
    if (exportProjPdfBtn) {
        exportProjPdfBtn.addEventListener("click", () => {
            window.exportProjectPDF(appState.selectedDetailProject);
        });
    }

    const closePdfViewerFn = () => {
        if (pdfViewerModal) pdfViewerModal.classList.remove("active");
        if (pdfEmbed) pdfEmbed.src = "";
    };

    if (closePdfViewerBtn) closePdfViewerBtn.addEventListener("click", closePdfViewerFn);
    if (closePdfViewerBtn2) closePdfViewerBtn2.addEventListener("click", closePdfViewerFn);
    window.addEventListener("click", (e) => {
        if (e.target === pdfViewerModal) closePdfViewerFn();
    });

    // --- 20. EDIT PROJECT MODAL ---
    const editProjectModal = document.getElementById("edit-project-modal");
    const closeEditProjectBtn = document.getElementById("close-edit-project-modal");
    const cancelEditProjectBtn = document.getElementById("cancel-edit-project-btn");
    const editProjectForm = document.getElementById("edit-project-form");
    const deleteProjectBtn = document.getElementById("btn-delete-project");
    const openEditProjectBtn = document.getElementById("open-edit-project-btn");

    const openEditProjectModal = () => {
        const code = appState.selectedDetailProject;
        if (!code || code === "all") {
            showToast("กรุณาเลือกรายการเฉพาะเจาะจงก่อนแก้ไข", "warning");
            return;
        }
        const proj = projectsData[code];
        if (!proj) return;

        const isQuoting = (appState.currentView === "quoting-projects-list") || (proj.status === "งานที่กำลังเสนอราคา" || proj.status === "งานที่รอเสนอราคา");
        const modalTitle = editProjectModal.querySelector(".modal-title");
        const valCostRow = document.getElementById("edit-proj-val-cost-row");
        const datesRow = document.getElementById("edit-proj-dates-row");
        const plannedGroup = document.getElementById("edit-proj-planned-group");

        if (isQuoting) {
            if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไขรายการเสนอราคา`;
            if (valCostRow) valCostRow.style.display = "none";
            if (datesRow) datesRow.style.display = "none";
            if (plannedGroup) plannedGroup.style.display = "none";
            const codeLabel = editProjectModal.querySelector("label[for='edit-project-code-display']");
            if (codeLabel) codeLabel.innerHTML = `เลขที่ใบเสนอราคา`;
            
            const editQuotingFields = document.getElementById("edit-quoting-fields-section");
            if (editQuotingFields) editQuotingFields.style.display = "block";
            
            document.getElementById("edit-quoting-site-visit-date").value = proj.siteVisitDate || "";
            document.getElementById("edit-quoting-comparison-1").value = proj.comparison1 || "";
            document.getElementById("edit-quoting-comparison-2").value = proj.comparison2 || "";
            document.getElementById("edit-quoting-remarks").value = proj.remarks || "";
            document.getElementById("edit-quoting-boq-file").value = ""; // Clear file selector
            
            const curFileEl = document.getElementById("edit-quoting-boq-current-file");
            if (curFileEl) {
                if (proj.boqFileName) {
                    curFileEl.innerHTML = `ไฟล์ BOQ ปัจจุบัน: <a href="#" onclick="event.preventDefault(); if (window.downloadFileFromSupabase) window.downloadFileFromSupabase('${proj.boqFileBase64}', '${proj.boqFileName.replace(/'/g, "\\'")}')" style="font-weight: 700; color: var(--primary-blue); text-decoration: underline;"><i class="fa-solid fa-file-arrow-down"></i> ${proj.boqFileName}</a>`;
                } else {
                    curFileEl.innerHTML = "ยังไม่มีไฟล์ BOQ";
                }
            }
        } else {
            if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไขข้อมูลโครงการ`;
            if (valCostRow) valCostRow.style.display = "flex";
            if (datesRow) datesRow.style.display = "flex";
            if (plannedGroup) plannedGroup.style.display = "block";
            const codeLabel = editProjectModal.querySelector("label[for='edit-project-code-display']");
            if (codeLabel) codeLabel.innerHTML = `รหัสโครงการ`;
            
            const editQuotingFields = document.getElementById("edit-quoting-fields-section");
            if (editQuotingFields) editQuotingFields.style.display = "none";
        }

        document.getElementById("edit-project-code").value = code;
        document.getElementById("edit-project-code-display").value = code;
        document.getElementById("edit-project-name").value = proj.name || "";
        
        const standardHospitals = [
            "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
            "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
            "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4"
        ];
        const customerEl = document.getElementById("edit-project-customer");
        const customerOtherGroup = document.getElementById("edit-proj-customer-other-group");
        const customerOtherInput = document.getElementById("edit-project-customer-other");
        if (customerEl) {
            const currentCustomer = proj.customer || "โรงพยาบาลพญาไท 1";
            if (standardHospitals.includes(currentCustomer)) {
                customerEl.value = currentCustomer;
                if (customerOtherGroup) customerOtherGroup.style.display = "none";
                if (customerOtherInput) {
                    customerOtherInput.value = "";
                    customerOtherInput.removeAttribute("required");
                }
            } else {
                customerEl.value = "อื่นๆ";
                if (customerOtherGroup) customerOtherGroup.style.display = "block";
                if (customerOtherInput) {
                    customerOtherInput.value = currentCustomer;
                    customerOtherInput.setAttribute("required", "true");
                }
            }
        }

        document.getElementById("edit-project-value").value = proj.value || 0;
        document.getElementById("edit-project-cost").value = proj.cost || 0;
        // Convert DD/MM/YYYY → YYYY-MM-DD for date inputs
        const toISO = (str) => {
            if (!str) return "";
            const parts = str.split("/");
            if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
            return "";
        };
        document.getElementById("edit-project-start").value = toISO(proj.start);
        document.getElementById("edit-project-end").value = toISO(proj.end);
        const poDateInput = document.getElementById("edit-project-podate");
        if (poDateInput) poDateInput.value = toISO(proj.poDate || proj.start);
        document.getElementById("edit-project-planned").value = proj.plannedProgress || 0;
        document.getElementById("edit-project-progress").value = proj.progress || 0;
        document.getElementById("edit-project-status").value = proj.status || "งานที่กำลังดำเนินการ";
        document.getElementById("edit-project-desc").value = proj.description || "";
        if (document.getElementById("edit-project-manager")) {
            document.getElementById("edit-project-manager").value = proj.manager || "";
        }
        if (document.getElementById("edit-project-owner")) {
            document.getElementById("edit-project-owner").value = proj.owner || "";
        }
        if (document.getElementById("edit-project-boq")) {
            document.getElementById("edit-project-boq").value = proj.boq || "";
        }

        const delBtn = document.getElementById("btn-delete-project");
        if (delBtn) {
            delBtn.style.display = (appState.currentRole === "pe") ? "none" : "";
        }
        if (editProjectModal) editProjectModal.classList.add("active");
    };

    const closeEditProjectModal = () => {
        if (editProjectModal) editProjectModal.classList.remove("active");
    };

    if (openEditProjectBtn) openEditProjectBtn.addEventListener("click", openEditProjectModal);
    if (closeEditProjectBtn) closeEditProjectBtn.addEventListener("click", closeEditProjectModal);
    if (cancelEditProjectBtn) cancelEditProjectBtn.addEventListener("click", closeEditProjectModal);
    window.addEventListener("click", (e) => {
        if (e.target === editProjectModal) closeEditProjectModal();
    });

    if (editProjectForm) {
        editProjectForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const code = document.getElementById("edit-project-code").value;
            const proj = projectsData[code];
            if (!proj) return;

            const isQuoting = (appState.currentView === "quoting-projects-list") || (proj.status === "งานที่กำลังเสนอราคา" || proj.status === "งานที่รอเสนอราคา");

            // Convert YYYY-MM-DD → DD/MM/YYYY
            const toThai = (str) => {
                if (!str) return "";
                const parts = str.split("-");
                if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                return "";
            };

            proj.name = document.getElementById("edit-project-name").value.trim();
            const customerEl = document.getElementById("edit-project-customer");
            if (customerEl) {
                if (customerEl.value === "อื่นๆ") {
                    const otherVal = document.getElementById("edit-project-customer-other") ? document.getElementById("edit-project-customer-other").value.trim() : "";
                    proj.customer = otherVal || "อื่นๆ";
                } else {
                    proj.customer = customerEl.value;
                }
            }
            proj.value = parseFloat(document.getElementById("edit-project-value").value) || 0;
            proj.cost = parseFloat(document.getElementById("edit-project-cost").value) || 0;
            proj.profit = proj.value - proj.cost;
            proj.start = toThai(document.getElementById("edit-project-start").value);
            proj.end = toThai(document.getElementById("edit-project-end").value);
            const poDateEditEl = document.getElementById("edit-project-podate");
            if (poDateEditEl && poDateEditEl.value) {
                proj.poDate = toThai(poDateEditEl.value);
            }
            proj.plannedProgress = parseFloat(document.getElementById("edit-project-planned").value) || 0;
            proj.progress = parseFloat(document.getElementById("edit-project-progress").value) || 0;
            proj.status = document.getElementById("edit-project-status").value;
            proj.description = document.getElementById("edit-project-desc").value.trim();
            if (document.getElementById("edit-project-manager")) {
                proj.manager = document.getElementById("edit-project-manager").value.trim();
            }
            if (document.getElementById("edit-project-owner")) {
                proj.owner = document.getElementById("edit-project-owner").value.trim();
            }
            if (document.getElementById("edit-project-boq")) {
                proj.boq = document.getElementById("edit-project-boq").value.trim();
            }

            // Save Quoting fields
            if (isQuoting) {
                const siteVisitEl = document.getElementById("edit-quoting-site-visit-date");
                if (siteVisitEl) proj.siteVisitDate = siteVisitEl.value;

                const comp1El = document.getElementById("edit-quoting-comparison-1");
                if (comp1El) proj.comparison1 = comp1El.value.trim();

                const comp2El = document.getElementById("edit-quoting-comparison-2");
                if (comp2El) proj.comparison2 = comp2El.value.trim();

                const remarksEl = document.getElementById("edit-quoting-remarks");
                if (remarksEl) proj.remarks = remarksEl.value.trim();

                const boqFileEl = document.getElementById("edit-quoting-boq-file");
                if (boqFileEl && boqFileEl.files && boqFileEl.files.length > 0) {
                    const file = boqFileEl.files[0];
                    proj.boqFileName = file.name;
                    showToast("กำลังอัปโหลดไฟล์ BOQ...", "info");
                    const base64Res = await readFileAsBase64(file);
                    
                    const fileKey = `FILE:${code}:BOQ:${Date.now()}:${file.name}`;
                    const { error: fileErr } = await supabaseClient.from('projects').upsert({
                        code: fileKey,
                        data: { fileUrl: base64Res.dataUrl },
                        updated_at: new Date().toISOString()
                    });
                    if (fileErr) {
                        showToast(`อัปโหลดไฟล์ BOQ ล้มเหลว: ${fileErr.message}`, "error");
                        return;
                    }
                    window.fileCache = window.fileCache || {};
                    window.fileCache[fileKey] = base64Res.dataUrl;
                    proj.boqFileBase64 = fileKey;
                }
            }

            // Save and sync immediately
            saveToLocalStorage();
            if (typeof queueSyncActiveProject === "function") {
                queueSyncActiveProject(code);
            }

            showToast(`แก้ไขข้อมูล ${code} เรียบร้อยแล้ว!`, "success");
            closeEditProjectModal();

            const isNewQuoting = (proj.status === "งานที่รอเสนอราคา" || proj.status === "งานที่กำลังเสนอราคา" || proj.status === "กำลังเสนอราคา");
            const isQuotingTab = appState.currentView === "quoting-projects-list";

            if (isNewQuoting && !isQuotingTab) {
                appState.selectedDetailProject = code;
                switchView("quoting-projects-list");
            } else if (!isNewQuoting && isQuotingTab) {
                appState.selectedDetailProject = code;
                switchView("projects-list");
            } else {
                populateSubnavProjects(document.getElementById("subnav-year-filter") ? document.getElementById("subnav-year-filter").value : "all");
                populateCostProjects();
                renderOverallDashboard();
                renderSubnavProjectWorkspace();
            }
        });
    }

    if (deleteProjectBtn) {
        deleteProjectBtn.addEventListener("click", function() {
            const code = document.getElementById("edit-project-code").value;
            if (!code || !projectsData[code]) return;
            if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโครงการ ${code} ออกจากระบบ?\nการลบนี้ไม่สามารถย้อนกลับได้!`)) {
                const projName = projectsData[code].name;
                delete projectsData[code];
                
                // Save updated list to local storage
                saveToLocalStorage();
                
                // Delete from Supabase
                deleteProjectFromSupabase(code);
                
                appState.selectedDetailProject = "";
                closeEditProjectModal();
                showToast(`ลบโครงการ ${code}: ${projName} ออกจากระบบสำเร็จ!`, "success");
                populateSubnavHospitals();
                populateSubnavProjects(document.getElementById("subnav-year-filter").value);
                populateCostHospitals();
                populateCostProjects();
                renderOverallDashboard();
                renderSubnavProjectWorkspace();
            }
        });
    }

    const resetDataBtn = document.getElementById("reset-system-data-btn");
    if (resetDataBtn) {
        resetDataBtn.addEventListener("click", async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (confirm("⚠️ คำเตือน! คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลโครงการและงานทั้งหมดในระบบให้เป็น 0?\nข้อมูลทั้งหมดบน Supabase Cloud และในเบราว์เซอร์จะถูกลบถาวร!")) {
                try {
                    // 1. Delete all projects on Supabase
                    const { error } = await supabaseClient.from('projects').delete().neq('code', 'abc');
                    if (error) throw error;
                    
                    // 2. Clear localStorage
                    localStorage.removeItem("technical_water_projects_data_v2");
                    
                    // 3. Reset in-memory data to empty
                    projectsData = {};
                    
                    // 4. Save to local storage
                    localStorage.setItem("technical_water_projects_data_v2", JSON.stringify(projectsData));
                    
                    // 5. Re-render UI with empty state
                    appState.selectedDetailProject = "";
                    appState.selectedCostProject = "";
                    
                    populateSubnavHospitals();
                    populateSubnavProjects("all");
                    populateCostHospitals();
                    populateCostProjects();
                    
                    renderOverallDashboard();
                    renderSubnavProjectWorkspace();
                    
                    showToast("ล้างข้อมูลระบบทั้งหมดเป็น 0 เรียบร้อยแล้ว!", "success");
                    document.getElementById("profile-dropdown").classList.remove("active");
                } catch (err) {
                    console.error("Error resetting data:", err);
                    showToast("เกิดข้อผิดพลาดในการล้างข้อมูล", "error");
                }
            }
        });
    }
});

// ============================================================
// AUTH SYSTEM - Login, Session, Public View, Share Link
// ============================================================

const USERS = {
    "admin":      { password: "1234", role: "admin",      displayName: "Super Admin",      roleLabel: "Admin Manager" },
    "pm":         { password: "1234", role: "pm",         displayName: "Project Manager",    roleLabel: "Project Manager" },
    "pm2":        { password: "1234", role: "pm",         displayName: "Project Manager 2", roleLabel: "Project Manager" },
    "accounting": { password: "1234", role: "accounting", displayName: "Account System",   roleLabel: "Accountant" }
};

const SESSION_KEY = "tw_session";

function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
}

function saveSession(username, role) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, role, ts: Date.now() }));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

window.getUserDetails = function(username) {
    if (!username) return null;
    const lowerUser = username.trim().toLowerCase();
    
    // Check static USERS
    if (USERS[lowerUser]) {
        const overridePass = (appState.staticUserOverrides && appState.staticUserOverrides[lowerUser]) 
            || localStorage.getItem("tw_pass_override_" + lowerUser);
        return {
            username: lowerUser,
            password: overridePass || USERS[lowerUser].password,
            role: USERS[lowerUser].role,
            displayName: USERS[lowerUser].displayName,
            roleLabel: USERS[lowerUser].roleLabel,
            userKey: null,
            isStatic: true
        };
    }
    
    // Check dynamic customerAccounts
    if (appState && appState.customerAccounts) {
        const found = Object.values(appState.customerAccounts).find(acc => (acc.username || "").toLowerCase() === lowerUser);
        if (found) {
            const r = found.role || "customer";
            let lbl = "Customer View";
            if (r === "admin") lbl = "Admin Manager";
            else if (r === "pm") lbl = "Project Manager";
            else if (r === "accounting") lbl = "Accountant";
            else if (r === "pe") lbl = "Project Engineer";
            else if (r === "technician" || r === "tech") lbl = "Technician View";
            return {
                username: lowerUser,
                password: found.password,
                role: r,
                displayName: found.name,
                roleLabel: lbl,
                userKey: found.userKey,
                isStatic: false
            };
        }
    }
    
    return null;
};

function applyLoginSuccess(username, role, userKey = null) {
    const overlay = document.getElementById("login-overlay");
    if (overlay) overlay.style.display = "none";

    const user = window.getUserDetails(username);
    if (user) {
        if ((role === "customer" || role === "pe" || role === "technician" || role === "tech") && user.userKey) {
            appState.currentCustomerUser = user.userKey;
            localStorage.setItem("technical_water_current_customer_user", user.userKey);
        }
        
        switchRole(role);
        
        // Update display names
        const usernameDisplay = document.getElementById("username-display");
        if (usernameDisplay) usernameDisplay.textContent = user.displayName;
        
        const roleDisplay = document.getElementById("user-role-display");
        if (roleDisplay) roleDisplay.textContent = user.roleLabel;
        
        const activeRoleBadge = document.getElementById("active-role-badge");
        if (activeRoleBadge) {
            if (role === "admin") {
                activeRoleBadge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> AD (Admin Manager)`;
            } else if (role === "pm") {
                activeRoleBadge.innerHTML = `<i class="fa-solid fa-user-lock"></i> PM (Project Manager)`;
            } else if (role === "accounting") {
                activeRoleBadge.innerHTML = `<i class="fa-solid fa-file-invoice-dollar"></i> AC (Accounting)`;
            } else if (role === "pe") {
                activeRoleBadge.innerHTML = `<i class="fa-solid fa-helmet-safety"></i> PE (Project Engineer)`;
            } else if (role === "technician" || role === "tech") {
                activeRoleBadge.innerHTML = `<i class="fa-solid fa-screwdriver-wrench"></i> Tech (Technician View)`;
            } else {
                activeRoleBadge.innerHTML = `<i class="fa-solid fa-user-tie"></i> CS (Customer View)`;
            }
        }

        // Update profile dropdown labels
        const ddName = document.getElementById("dropdown-user-name");
        if (ddName) ddName.textContent = user.displayName;
        
        const ddRole = document.getElementById("dropdown-user-role");
        if (ddRole) ddRole.textContent = user.roleLabel;
    }
    saveSession(username, role);
}

function showLoginError(msg) {
    let errEl = document.getElementById("login-error-msg");
    if (!errEl) {
        errEl = document.createElement("p");
        errEl.id = "login-error-msg";
        errEl.style.cssText = "color: #ef4444; font-size: 12px; text-align: center; margin: -8px 0 0 0; font-weight: 600;";
        const form = document.getElementById("login-form");
        if (form) form.appendChild(errEl);
    }
    errEl.textContent = msg;
}

// ---- Shared Multi-Project/Hospital View Mode Init ----
window.initSharedView = async function(linkId) {
    document.body.className = "role-customer public-view-mode";
    const overlay = document.getElementById("login-overlay");
    if (overlay) overlay.style.display = "none";
    appState.currentRole = "customer";

    // Update active role badge and user displays for Guest
    const activeRoleBadge = document.getElementById("active-role-badge");
    if (activeRoleBadge) {
        activeRoleBadge.innerHTML = `<i class="fa-solid fa-share-nodes"></i> Shared Guest`;
    }
    const usernameDisplay = document.getElementById("username-display");
    if (usernameDisplay) {
        usernameDisplay.textContent = "Guest (Shared)";
    }
    const roleDisplay = document.getElementById("user-role-display");
    if (roleDisplay) {
        roleDisplay.textContent = "Viewer";
    }

    showToast("กำลังโหลดรายละเอียดจากลิงก์แชร์...", "info");
    
    try {
        const { data, error } = await supabaseClient.from('projects').select('data').eq('code', `SHARE:${linkId}`).single();
        if (error || !data || !data.data) {
            showToast("ลิงก์แชร์นี้หมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบ", "error");
            if (overlay) overlay.style.display = "flex";
            return;
        }

        const shareConfig = data.data;
        appState.activeShareConfig = shareConfig;
        
        // Wait for Supabase projects data load
        const waitAndRenderShared = () => {
            if (Object.keys(projectsData).length > 0) {
                const allowedCodes = new Set();
                
                // 1. Explicit project codes
                if (shareConfig.projectCodes) {
                    shareConfig.projectCodes.forEach(code => allowedCodes.add(code));
                }
                // 2. Hospital projects
                if (shareConfig.hospitals) {
                    Object.values(projectsData).forEach(p => {
                        if (shareConfig.hospitals.includes(p.customer)) {
                            allowedCodes.add(p.code);
                        }
                    });
                }
                
                appState.allowedShareProjects = Array.from(allowedCodes);
                
                if (appState.allowedShareProjects.length === 0) {
                    showToast("ไม่มีโครงการย่อยที่เปิดแชร์ในลิงก์นี้", "warning");
                    if (overlay) overlay.style.display = "flex";
                    return;
                }
                
                // Override allowed project check for security
                window.isProjectAllowedForCustomer = function(p, perms) {
                    return appState.allowedShareProjects.includes(p.code);
                };
                
                if (appState.allowedShareProjects.length === 1) {
                    // Open single project
                    appState.selectedDetailProject = appState.allowedShareProjects[0];
                    switchView("projects-list");
                    renderSubnavProjectWorkspace();
                } else {
                    // Open list portal filtered
                    appState.selectedDetailProject = "all";
                    switchView("projects-list");
                    if (typeof window.renderProjectSelectionPortal === "function") {
                        window.renderProjectSelectionPortal();
                    }
                }
            } else {
                setTimeout(waitAndRenderShared, 300);
            }
        };
        waitAndRenderShared();
        
    } catch (err) {
        console.error("Shared view loading error:", err);
        showToast("โหลดลิงก์แชร์ล้มเหลว", "error");
    }
};

// ---- Public View Mode Init ----
function initPublicView(projectCode) {
    document.body.className = "role-customer public-view-mode";
    // Hide login overlay unconditionally
    const overlay = document.getElementById("login-overlay");
    if (overlay) overlay.style.display = "none";

    // Set role to customer for public view mode
    appState.currentRole = "customer";

    // Update active role badge and user displays for Guest/Viewer
    const activeRoleBadge = document.getElementById("active-role-badge");
    if (activeRoleBadge) {
        activeRoleBadge.innerHTML = `<i class="fa-solid fa-eye"></i> Guest`;
    }
    const usernameDisplay = document.getElementById("username-display");
    if (usernameDisplay) {
        usernameDisplay.textContent = "Guest";
    }
    const roleDisplay = document.getElementById("user-role-display");
    if (roleDisplay) {
        roleDisplay.textContent = "Viewer";
    }
    const avatarImg = document.querySelector(".profile-trigger .avatar");
    if (avatarImg) {
        avatarImg.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100";
    }

    appState.selectedDetailProject = projectCode;
    // Allow specifying a subtab via URL parameter, e.g., ?project=XYZ&tab=plan-work
    const publicUrlParams = new URLSearchParams(window.location.search);
    const tabParam = publicUrlParams.get("tab");
    if (tabParam) {
        appState.activeProjectTab = tabParam;
        window.shouldScrollToTab = tabParam;
    }

    // Navigate to projects-list view (which shows project detail workspace)
    switchView("projects-list");

    // Wait for Supabase data to load, then render project detail
    const waitAndRender = () => {
        const p = projectsData[projectCode];
        if (p) {
            const subtitle = document.getElementById("public-proj-subtitle");
            if (subtitle) subtitle.textContent = `รายงานความคืบหน้า: ${p.name}`;
            renderSubnavProjectWorkspace();
        } else {
            setTimeout(waitAndRender, 400);
        }
    };
    waitAndRender();
}

// ---- On Page Load ----
(function initAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get("share");
    const sharedCode = urlParams.get("project");

    if (shareId) {
        // Multi-project/hospital shared link - bypass login
        if (window.initSharedView) {
            window.initSharedView(shareId);
        }
        return;
    }

    if (sharedCode) {
        // Public share link - bypass login
        initPublicView(sharedCode);
        return;
    }

    // Normal login flow
    const path = window.location.pathname;
    const session = getSession();

    if (path === "/login" || path === "/") {
        if (session) {
            const user = window.getUserDetails(session.username);
            if (user) {
                window.location.href = "/dashboard";
                return;
            }
        }
        const overlay = document.getElementById("login-overlay");
        if (overlay) overlay.style.display = "flex";
    } else {
        if (!session) {
            window.location.href = "/login";
            return;
        }
        const user = window.getUserDetails(session.username);
        if (!user) {
            window.location.href = "/login";
            return;
        }
        applyLoginSuccess(session.username, session.role, user.userKey);
    }

    // Login form submit handler
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const username = document.getElementById("login-username").value.trim();
            const password = document.getElementById("login-password").value;
            
            const user = window.getUserDetails(username);
            if (user && user.password === password) {
                applyLoginSuccess(username, user.role, user.userKey);
                showToast(`ยินดีต้อนรับคุณ ${user.displayName}!`, "success");
                window.location.href = "/dashboard";
            } else {
                showLoginError("⚠️ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
            }
        });
    }

    // Change Password handlers
    const changePasswordBtn = document.getElementById("change-my-password-btn");
    const changePasswordModal = document.getElementById("change-password-modal");
    const closeChangePasswordBtn = document.getElementById("close-change-password-modal");
    const cancelChangePasswordBtn = document.getElementById("cancel-change-password-btn");
    const changePasswordForm = document.getElementById("change-password-form");

    if (changePasswordBtn) {
        changePasswordBtn.addEventListener("click", () => {
            const session = getSession();
            if (!session || !session.username) {
                showToast("กรุณาเข้าสู่ระบบก่อนทำการเปลี่ยนรหัสผ่าน", "warning");
                return;
            }
            // Clear fields
            document.getElementById("chg-pass-current").value = "";
            document.getElementById("chg-pass-new").value = "";
            document.getElementById("chg-pass-confirm").value = "";
            
            // Close profile dropdown
            const dropdown = document.getElementById("profile-dropdown");
            if (dropdown) dropdown.classList.remove("active");
            
            // Open modal
            if (changePasswordModal) changePasswordModal.classList.add("active");
        });
    }

    const closeChangePassword = () => {
        if (changePasswordModal) changePasswordModal.classList.remove("active");
    };

    if (closeChangePasswordBtn) closeChangePasswordBtn.onclick = closeChangePassword;
    if (cancelChangePasswordBtn) cancelChangePasswordBtn.onclick = closeChangePassword;

    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const currentPass = document.getElementById("chg-pass-current").value;
            const newPass = document.getElementById("chg-pass-new").value;
            const confirmPass = document.getElementById("chg-pass-confirm").value;

            const session = getSession();
            if (!session || !session.username) return;

            const user = window.getUserDetails(session.username);
            if (!user) {
                showToast("ไม่พบข้อมูลผู้ใช้งาน", "error");
                return;
            }

            // Verify current password
            if (user.password !== currentPass) {
                showToast("⚠️ รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง", "error");
                return;
            }

            // Verify new password matches confirm password
            if (newPass !== confirmPass) {
                showToast("⚠️ รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกัน", "warning");
                return;
            }

            // Prevent changing to the same password
            if (currentPass === newPass) {
                showToast("⚠️ รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน", "warning");
                return;
            }

            try {
                if (user.isStatic) {
                    // Save password override to appState and sync to Supabase
                    if (!appState.staticUserOverrides) appState.staticUserOverrides = {};
                    appState.staticUserOverrides[user.username] = newPass;
                    await saveCustomerAccounts();
                } else {
                    // Dynamic user, save to customerAccounts and sync to Supabase
                    if (appState.customerAccounts && user.userKey && appState.customerAccounts[user.userKey]) {
                        appState.customerAccounts[user.userKey].password = newPass;
                        await saveCustomerAccounts();
                    } else {
                        throw new Error("User key not found in customerAccounts");
                    }
                }
                showToast("🔒 เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!", "success");
                closeChangePassword();
            } catch (err) {
                console.error("Change password error:", err);
                showToast("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน", "error");
            }
        });
    }

    // Logout button handler
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            if (window.ganttIsDirty) {
                if (!confirm("⚠️ คุณมีข้อมูลแผนงาน (Plan Work) ที่ยังไม่ได้บันทึก!\nหากออกจากระบบ ข้อมูลล่าสุดที่คุณแก้ไขจะสูญหาย\n\nคุณต้องการออกจากระบบโดยไม่บันทึกใช่หรือไม่?")) {
                    return;
                }
                window.ganttIsDirty = false;
            }
            if (confirm("คุณต้องการออกจากระบบใช่ไหม?")) {
                clearSession();
                window.location.href = "/login";
            }
        });
    }

    // Share link button handler
    const shareBtn = document.getElementById("copy-share-link-btn");
    if (shareBtn) {
        shareBtn.addEventListener("click", function() {
            const code = appState.selectedDetailProject;
            if (!code || code === "all") {
                showToast("กรุณาเลือกโครงการก่อนคัดลอกลิงก์", "error");
                return;
            }
            const tabName = appState.activeProjectTab || "general-info";
            const shareUrl = `${window.location.origin}${window.location.pathname}?project=${encodeURIComponent(code)}&tab=${encodeURIComponent(tabName)}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                showToast(`✅ คัดลอกลิงก์แชร์โครงการ ${code} เรียบร้อยแล้ว!`, "success");
            }).catch(() => {
                // Fallback
                const ta = document.createElement("textarea");
                ta.value = shareUrl;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                showToast(`✅ คัดลอกลิงก์แชร์โครงการ ${code} เรียบร้อยแล้ว!`, "success");
            });
        });
    }
})();

// ============================================================
// USER PERMISSIONS & CUSTOMER USER ACCOUNTS MANAGEMENT
// ============================================================

window.toggleShowPassword = function(key) {
    const input = document.getElementById(`pass-field-${key}`);
    const icon = document.getElementById(`eye-icon-${key}`);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        if (icon) icon.className = "fa-solid fa-eye-slash";
    } else {
        input.type = "password";
        if (icon) icon.className = "fa-solid fa-eye";
    }
};

window.copyCustomerLogin = function(key) {
    const acc = appState.customerAccounts[key];
    if (!acc) return;
    const text = `🏢 ระบบจัดการโครงการ (Project Management System)\n🌐 ลิงก์เข้าใช้งานระบบ: ${window.location.origin || 'https://technical-water-system.vercel.app'}\n👤 Username: ${acc.username}\n🔑 Password: ${acc.password}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`📋 คัดลอกข้อมูล Username & Password ของ "${acc.name || acc.username}" เรียบร้อยแล้ว!`, "success");
        });
    } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast(`📋 คัดลอกข้อมูล Username & Password ของ "${acc.name || acc.username}" เรียบร้อยแล้ว!`, "success");
    }
};

window.selectUserForPermission = function(key) {
    const selector = document.getElementById("perm-user-selector");
    if (selector) {
        selector.value = key;
        selector.dispatchEvent(new Event("change"));
        selector.scrollIntoView({ behavior: "smooth", block: "center" });
    }
};

window.deleteCustomerAccount = function(key) {
    const acc = appState.customerAccounts[key];
    if (!acc) return;
    if (Object.keys(appState.customerAccounts).length <= 1) {
        showToast("ไม่สามารถลบบัญชีลูกค้าทั้งหมดได้ ต้องมีอย่างน้อย 1 บัญชีในระบบ", "warning");
        return;
    }
    if (!confirm(`ยืนยันการลบบัญชีลูกค้า "${acc.name}" (${acc.username}) ออกจากระบบ?`)) return;
    
    delete appState.customerAccounts[key];
    if (appState.userPermissions && appState.userPermissions[key]) {
        delete appState.userPermissions[key];
    }
    saveCustomerAccounts();
    saveUserPermissions();
    showToast(`ลบบัญชี "${acc.name || acc.username}" เรียบร้อยแล้ว`, "info");
    renderPermissionsManagement();
};


function renderPermissionsManagement() {
    const userSelector = document.getElementById("perm-user-selector");
    if (!userSelector) return;

    function populatePermUserSelector() {
        const curVal = userSelector.value;
        userSelector.innerHTML = "";
        Object.entries(appState.customerAccounts || {}).forEach(([key, acc]) => {
            const opt = document.createElement("option");
            opt.value = key;
            opt.textContent = acc.name ? `${acc.name} (${acc.username})` : `บัญชีผู้ใช้: ${acc.username}`;
            userSelector.appendChild(opt);
        });
        if (curVal && appState.customerAccounts[curVal]) {
            userSelector.value = curVal;
        } else if (userSelector.options.length > 0) {
            userSelector.selectedIndex = 0;
        }
    }

    window.renderCustomerAccountsTable = function() {
        const tbody = document.getElementById("customer-accounts-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        const searchInput = document.getElementById("search-customer-accounts");
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

        let accounts = Object.entries(appState.customerAccounts || {});
        if (query) {
            accounts = accounts.filter(([key, acc]) => {
                return (acc.name || "").toLowerCase().includes(query) || (acc.username || "").toLowerCase().includes(query);
            });
        }

        if (accounts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted); font-size: 12px;">${query ? 'ไม่พบบัญชีที่ค้นหา' : 'ไม่พบข้อมูลบัญชีลูกค้า — กดปุ่ม "เจนบัญชีลูกค้าใหม่" เพื่อสร้างบัญชี'}</td></tr>`;
            return;
        }

        accounts.forEach(([key, acc], index) => {
            const perms = (appState.userPermissions || {})[key] || { hospitals: [], projects: [] };
            const hCount = (perms.hospitals || []).length;
            const pCount = (perms.projects || []).length;
            const role = acc.role || "customer";

            let roleBadgeHTML = "";
            let permBtnHTML = "";
            if (role === "admin") {
                roleBadgeHTML = `<span style="font-size: 10.5px; font-weight: 700; padding: 2.5px 8px; border-radius: 12px; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-shield-halved"></i> Admin</span>`;
                permBtnHTML = `<button type="button" class="btn btn-xs btn-outline" style="font-size: 10.5px; padding: 4px 8px; opacity: 0.5; cursor: not-allowed;" disabled><i class="fa-solid fa-sliders"></i> จัดการสิทธิ์ไม่ได้</button>`;
            } else if (role === "pm") {
                roleBadgeHTML = `<span style="font-size: 10.5px; font-weight: 700; padding: 2.5px 8px; border-radius: 12px; background: #dcfce7; color: #15803d; border: 1px solid #86efac; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-user-lock"></i> PM (Project)</span>`;
                permBtnHTML = `<button type="button" class="btn btn-xs btn-outline" style="font-size: 10.5px; padding: 4px 8px; opacity: 0.5; cursor: not-allowed;" disabled><i class="fa-solid fa-sliders"></i> จัดการสิทธิ์ไม่ได้</button>`;
            } else if (role === "accounting") {
                roleBadgeHTML = `<span style="font-size: 10.5px; font-weight: 700; padding: 2.5px 8px; border-radius: 12px; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-file-invoice-dollar"></i> AC (Account)</span>`;
                permBtnHTML = `<button type="button" class="btn btn-xs btn-outline" style="font-size: 10.5px; padding: 4px 8px; opacity: 0.5; cursor: not-allowed;" disabled><i class="fa-solid fa-sliders"></i> จัดการสิทธิ์ไม่ได้</button>`;
            } else if (role === "pe") {
                roleBadgeHTML = `<span style="font-size: 10.5px; font-weight: 700; padding: 2.5px 8px; border-radius: 12px; background: #fef3c7; color: #d97706; border: 1px solid #fcd34d; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-helmet-safety"></i> PE (${hCount} รพ. / ${pCount} งาน)</span>`;
                permBtnHTML = `<button type="button" class="btn btn-xs btn-outline" onclick="window.selectUserForPermission('${key}')" title="เลือกบัญชีนี้เพื่อปรับสิทธิ์" style="font-size: 10.5px; padding: 4px 8px;"><i class="fa-solid fa-sliders"></i> จัดการสิทธิ์</button>`;
            } else if (role === "technician" || role === "tech") {
                roleBadgeHTML = `<span style="font-size: 10.5px; font-weight: 700; padding: 2.5px 8px; border-radius: 12px; background: #fae8ff; color: #a21caf; border: 1px solid #f5d0fe; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-screwdriver-wrench"></i> Tech (${hCount} รพ. / ${pCount} งาน)</span>`;
                permBtnHTML = `<button type="button" class="btn btn-xs btn-outline" onclick="window.selectUserForPermission('${key}')" title="เลือกบัญชีนี้เพื่อปรับสิทธิ์" style="font-size: 10.5px; padding: 4px 8px;"><i class="fa-solid fa-sliders"></i> จัดการสิทธิ์</button>`;
            } else {
                roleBadgeHTML = `<span style="font-size: 10.5px; font-weight: 700; padding: 2.5px 8px; border-radius: 12px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-user-tie"></i> Customer (${hCount} รพ. / ${pCount} งาน)</span>`;
                permBtnHTML = `<button type="button" class="btn btn-xs btn-outline" onclick="window.selectUserForPermission('${key}')" title="เลือกบัญชีนี้เพื่อปรับสิทธิ์" style="font-size: 10.5px; padding: 4px 8px;"><i class="fa-solid fa-sliders"></i> จัดการสิทธิ์</button>`;
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="text-align: center; font-weight: 700; color: var(--text-muted);">${index + 1}</td>
                <td style="font-weight: 700; color: var(--navy-dark);">${acc.name || '<span class="text-muted" style="font-size: 11px; font-weight: normal;">(ไม่ได้ระบุชื่อ)</span>'}</td>
                <td><span style="font-family: monospace; font-weight: 700; color: #1e40af; background: #dbeafe; padding: 3px 8px; border-radius: 4px; border: 1px solid #93c5fd;">${acc.username}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <input type="password" value="${acc.password}" id="pass-field-${key}" readonly style="width: 100px; font-family: monospace; font-size: 12px; font-weight: 700; border: none; background: transparent; color: var(--navy-dark);" autocomplete="off">
                        <button type="button" class="btn btn-xs btn-outline" onclick="window.toggleShowPassword('${key}')" title="แสดง/ซ่อนรหัสผ่าน" style="padding: 2px 6px;"><i class="fa-solid fa-eye" id="eye-icon-${key}"></i></button>
                    </div>
                </td>
                <td style="text-align: center;">
                    ${roleBadgeHTML}
                </td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 4px; justify-content: center;">
                        <button type="button" class="btn btn-xs btn-outline-blue" onclick="window.copyCustomerLogin('${key}')" title="คัดลอกข้อมูลล็อกอินส่งให้ลูกค้า" style="font-size: 10.5px; padding: 4px 8px;">
                            <i class="fa-solid fa-copy"></i> คัดลอก
                        </button>
                        ${permBtnHTML}
                        <button type="button" class="btn btn-xs btn-outline-red" onclick="window.deleteCustomerAccount('${key}')" title="ลบบัญชีนี้" style="font-size: 10.5px; padding: 4px 6px;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    populatePermUserSelector();
    window.renderCustomerAccountsTable();

    const allHospitals = [
        "โรงพยาบาลพญาไท 1", "โรงพยาบาลพญาไท 2", "โรงพยาบาลพญาไท 3", "โรงพยาบาลพญาไท นวมินทร์",
        "โรงพยาบาลพญาไท บ่อวิน", "โรงพยาบาลพญาไท พหลโยธิน", "โรงพยาบาลพญาไท ศรีราชา", "โรงพยาบาลเปาโล พระประแดง",
        "โรงพยาบาลเปาโล รังสิต", "โรงพยาบาลเปาโล สมุทรปราการ", "โรงพยาบาลเปาโล เกษตร", "โรงพยาบาลเปาโล โชคชัย 4",
        "อื่นๆ"
    ];

    let currentAllowedProjects = new Set();

    function renderProjectsList() {
        const pList = document.getElementById("perm-projects-checkbox-list");
        if (!pList) return;
        pList.innerHTML = "";

        const checkedHospitals = [...document.querySelectorAll("#perm-hospitals-checkbox-list input[type='checkbox']:checked")]
            .map(cb => cb.getAttribute("data-hospital"));

        if (checkedHospitals.length === 0) {
            pList.innerHTML = `<div style="text-align:center; color: var(--text-muted); font-size: 12px; padding: 32px 16px; font-style: italic;">
                <i class="fa-solid fa-hospital text-blue" style="font-size: 24px; display: block; margin-bottom: 8px; opacity: 0.5;"></i>
                กรุณาเลือกติ๊กโรงพยาบาลด้านซ้าย เพื่อดูและกำหนดสิทธิ์โครงการย่อย
            </div>`;
            return;
        }

        const allProjects = Object.values(projectsData).filter(p => checkedHospitals.includes(p.customer));
        if (allProjects.length === 0) {
            pList.innerHTML = `<div style="text-align:center; color: var(--text-muted); font-size: 12px; padding: 24px;">ไม่พบรายการโครงการสำหรับโรงพยาบาลที่เลือก</div>`;
            return;
        }

        // Group by hospital
        const grouped = {};
        allProjects.forEach(p => {
            if (!grouped[p.customer]) grouped[p.customer] = [];
            grouped[p.customer].push(p);
        });

        Object.keys(grouped).forEach(hosp => {
            const projectCodesUnderHosp = grouped[hosp].map(p => p.code);
            const allChecked = projectCodesUnderHosp.every(code => currentAllowedProjects.has(code));
            const someChecked = projectCodesUnderHosp.some(code => currentAllowedProjects.has(code)) && !allChecked;

            const headerId = `perm-hosp-header-${hosp.replace(/\s+/g, "-")}`;
            const groupHeader = document.createElement("div");
            groupHeader.style.cssText = "display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: var(--primary-blue); margin-top: 12px; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed var(--border-color);";
            groupHeader.innerHTML = `
                <input type="checkbox" id="${headerId}" style="width: 14px; height: 14px; accent-color: var(--primary-blue); cursor: pointer;" ${allChecked ? "checked" : ""}>
                <label for="${headerId}" style="cursor: pointer; font-family: 'Prompt', sans-serif; display: inline-flex; align-items: center; gap: 4px; margin: 0; user-select: none;">
                    ${hosp.replace("โรงพยาบาล", "รพ.")} <span style="font-size: 9px; font-weight: 500; color: var(--text-muted); text-transform: none;">(เลือกทั้งหมดใน รพ. นี้)</span>
                </label>
            `;
            pList.appendChild(groupHeader);

            const headerCb = groupHeader.querySelector(`#${headerId}`);
            if (headerCb) {
                headerCb.indeterminate = someChecked;
                headerCb.addEventListener("change", () => {
                    const isChecked = headerCb.checked;
                    grouped[hosp].forEach(proj => {
                        if (isChecked) {
                            currentAllowedProjects.add(proj.code);
                        } else {
                            currentAllowedProjects.delete(proj.code);
                        }
                        
                        const projCb = document.getElementById(`perm-p-${proj.code.replace(/\s+/g, "-")}`);
                        if (projCb) {
                            projCb.checked = isChecked;
                            const projWrapper = projCb.parentElement;
                            if (projWrapper) {
                                projWrapper.style.borderColor = isChecked ? "#bfdbfe" : "var(--border-color)";
                                projWrapper.style.background = isChecked ? "#eff6ff" : "transparent";
                            }
                        }
                    });
                });
            }

            grouped[hosp].forEach(p => {
                const isChecked = currentAllowedProjects.has(p.code);
                const id = `perm-p-${p.code.replace(/\s+/g, "-")}`;
                const wrapper = document.createElement("label");
                wrapper.style.cssText = "display: flex; align-items: flex-start; gap: 10px; cursor: pointer; padding: 8px 10px; border-radius: 6px; border: 1px solid " + (isChecked ? "#bfdbfe" : "var(--border-color)") + "; background: " + (isChecked ? "#eff6ff" : "transparent") + "; transition: all 0.15s; margin-bottom: 4px;";
                wrapper.htmlFor = id;
                wrapper.innerHTML = `
                    <input type="checkbox" id="${id}" data-project="${p.code}" ${isChecked ? "checked" : ""} style="width: 15px; height: 15px; accent-color: var(--primary-blue); cursor: pointer; flex-shrink: 0; margin-top: 1px;">
                    <div>
                        <div style="font-size: 12px; font-weight: 700; color: var(--navy-dark);">${p.code}</div>
                        <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 1px;">${p.name.replace(/ \(\d{4}\)$/, '')}</div>
                    </div>`;
                const cb = wrapper.querySelector("input");
                cb.addEventListener("change", () => {
                    if (cb.checked) {
                        currentAllowedProjects.add(p.code);
                    } else {
                        currentAllowedProjects.delete(p.code);
                    }
                    wrapper.style.borderColor = cb.checked ? "#bfdbfe" : "var(--border-color)";
                    wrapper.style.background = cb.checked ? "#eff6ff" : "transparent";

                    if (headerCb) {
                        const allCheckedNow = projectCodesUnderHosp.every(code => currentAllowedProjects.has(code));
                        headerCb.checked = allCheckedNow;
                        headerCb.indeterminate = !allCheckedNow && projectCodesUnderHosp.some(code => currentAllowedProjects.has(code));
                    }
                });
                pList.appendChild(wrapper);
            });
        });
    }

    function loadCheckboxes(cUserKey) {
        const acc = (appState.customerAccounts || {})[cUserKey];
        const userInfoEl = document.getElementById("perm-current-user-info");
        if (userInfoEl && acc) {
            userInfoEl.innerHTML = `<i class="fa-solid fa-user-check mr-1"></i> กำลังปรับสิทธิ์ของ: <strong>${acc.name}</strong> (${acc.username})`;
        }

        const perms = appState.userPermissions[cUserKey] || { hospitals: [], projects: [] };
        const allowedH = perms.hospitals || [];
        const allowedP = perms.projects || [];

        currentAllowedProjects = new Set(allowedP);

        // Render hospitals
        const hList = document.getElementById("perm-hospitals-checkbox-list");
        if (hList) {
            hList.innerHTML = "";
            allHospitals.forEach(h => {
                const isChecked = allowedH.includes(h);
                const id = `perm-h-${h.replace(/\s+/g, "-")}`;
                const wrapper = document.createElement("label");
                wrapper.style.cssText = "display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 10px; border-radius: 6px; border: 1px solid " + (isChecked ? "#bfdbfe" : "var(--border-color)") + "; background: " + (isChecked ? "#eff6ff" : "transparent") + "; transition: all 0.15s;";
                wrapper.htmlFor = id;
                wrapper.innerHTML = `
                    <input type="checkbox" id="${id}" data-hospital="${h}" ${isChecked ? "checked" : ""} style="width: 15px; height: 15px; accent-color: var(--primary-blue); cursor: pointer; flex-shrink: 0;">
                    <div>
                        <div style="font-size: 12.5px; font-weight: 600; color: var(--navy-dark);">${h}</div>
                    </div>`;
                const cb = wrapper.querySelector("input");
                cb.addEventListener("change", () => {
                    wrapper.style.borderColor = cb.checked ? "#bfdbfe" : "var(--border-color)";
                    wrapper.style.background = cb.checked ? "#eff6ff" : "transparent";
                    renderProjectsList();
                });
                hList.appendChild(wrapper);
            });
        }

        renderProjectsList();
    }

    // Initial load
    loadCheckboxes(userSelector.value || "user1");

    // On user selector change
    userSelector.addEventListener("change", function() {
        loadCheckboxes(this.value);
    });

    // Toggle-all hospitals
    const toggleAllHospitalsBtn = document.getElementById("btn-toggle-all-hospitals");
    if (toggleAllHospitalsBtn) {
        toggleAllHospitalsBtn.onclick = function() {
            const checkboxes = document.querySelectorAll("#perm-hospitals-checkbox-list input[type='checkbox']");
            const allChecked = [...checkboxes].every(cb => cb.checked);
            checkboxes.forEach(cb => {
                cb.checked = !allChecked;
                cb.parentElement.style.borderColor = cb.checked ? "#bfdbfe" : "var(--border-color)";
                cb.parentElement.style.background = cb.checked ? "#eff6ff" : "transparent";
            });
            toggleAllHospitalsBtn.textContent = allChecked ? "เลือกทั้งหมด" : "ยกเลิกทั้งหมด";
            renderProjectsList();
        };
    }

    // Toggle-all projects
    const toggleAllProjectsBtn = document.getElementById("btn-toggle-all-projects");
    if (toggleAllProjectsBtn) {
        toggleAllProjectsBtn.onclick = function() {
            const checkboxes = document.querySelectorAll("#perm-projects-checkbox-list input[type='checkbox'][data-project]");
            if (checkboxes.length === 0) return;
            const allChecked = [...checkboxes].every(cb => cb.checked);
            checkboxes.forEach(cb => {
                const projCode = cb.getAttribute("data-project");
                if (projCode) {
                    if (!allChecked) {
                        currentAllowedProjects.add(projCode);
                    } else {
                        currentAllowedProjects.delete(projCode);
                    }
                }
            });
            toggleAllProjectsBtn.textContent = allChecked ? "เลือกทั้งหมด" : "ยกเลิกทั้งหมด";
            renderProjectsList();
        };
    }

    // Save permissions
    const saveBtn = document.getElementById("btn-save-permissions");
    if (saveBtn) {
        saveBtn.onclick = function() {
            const cUserKey = document.getElementById("perm-user-selector").value || "user1";
            const hospitals = [...document.querySelectorAll("#perm-hospitals-checkbox-list input[type='checkbox']:checked")]
                .map(cb => cb.getAttribute("data-hospital")).filter(Boolean);
            const projects = Array.from(currentAllowedProjects).filter(Boolean);
            if (!appState.userPermissions) appState.userPermissions = {};
            appState.userPermissions[cUserKey] = { hospitals, projects };
            saveUserPermissions();
            
            const acc = (appState.customerAccounts || {})[cUserKey];
            const userName = acc ? acc.name : cUserKey;
            showToast(`✅ บันทึกสิทธิ์ของ "${userName}" เรียบร้อยแล้ว (โรงพยาบาล: ${hospitals.length} แห่ง, โครงการ: ${projects.length} รายการ)`, "success");
            renderCustomerAccountsTable();
        };
    }

    // Reset permissions
    const resetBtn = document.getElementById("btn-reset-permissions");
    if (resetBtn) {
        resetBtn.onclick = function() {
            if (!confirm("ยืนยันการรีเซ็ตสิทธิ์ทั้งหมด (ทุก Customer User) กลับสู่ค่าเริ่มต้น?")) return;
            appState.userPermissions = defaultPermissions;
            saveUserPermissions();
            loadCheckboxes(document.getElementById("perm-user-selector").value || "user1");
            showToast("🔄 รีเซ็ตสิทธิ์ทั้งหมดกลับสู่ค่าเริ่มต้นเรียบร้อยแล้ว", "info");
            renderCustomerAccountsTable();
        };
    }
}

// ============================================================
// PO OUTSTANDING TABLE & APPROVAL PENDING TABLE
// ============================================================

(function initCostSubTables() {

    // ── localStorage helpers ──────────────────────────────────
    function loadPOData()       { return JSON.parse(localStorage.getItem("tw_po_outstanding") || "[]"); }
    function savePOData(d)      { localStorage.setItem("tw_po_outstanding", JSON.stringify(d)); }
    function loadApprovalData() { return JSON.parse(localStorage.getItem("tw_approval_pending") || "[]"); }
    function saveApprovalData(d){ localStorage.setItem("tw_approval_pending", JSON.stringify(d)); }

    // ── Render PO table ───────────────────────────────────────
    function renderPOTable() {
        const tbody = document.getElementById("po-outstanding-tbody");
        if (!tbody) return;
        const rows = loadPOData();
        const emptyRow = document.getElementById("po-empty-row");
        // Remove data rows (keep empty-row placeholder)
        tbody.querySelectorAll("tr.po-data-row").forEach(r => r.remove());
        if (rows.length === 0) {
            if (emptyRow) emptyRow.style.display = "";
            return;
        }
        if (emptyRow) emptyRow.style.display = "none";
        rows.forEach((row, idx) => {
            const tr = document.createElement("tr");
            tr.className = "po-data-row";
            tr.style.cssText = "border-bottom: 1px solid var(--border-color);";
            tr.innerHTML = `
                <td style="text-align:center; font-weight:700; color:var(--navy-dark);">${idx + 1}</td>
                <td style="font-size:12px;">${row.hospital || '-'}</td>
                <td style="font-size:12px;">${row.poDate || '-'}</td>
                <td style="font-size:12px;">${row.quotationNo || '-'}</td>
                <td style="font-size:12px; font-weight:600; color:var(--primary-blue);">${row.poNo || '-'}</td>
                <td style="font-size:12px;">${row.jobName || '-'}</td>
                <td style="font-size:12px;">${row.location || '-'}</td>
                <td style="text-align:center;">
                    <button class="btn btn-sm" onclick="openEditPORow(${idx})" style="font-size:10px; padding:3px 8px; background:#dbeafe; color:#1e40af; border:1px solid #93c5fd; border-radius:4px; cursor:pointer; font-family:'Prompt';"><i class="fa-solid fa-pen"></i> แก้ไข</button>
                    <button class="btn btn-sm" onclick="deletePORow(${idx})" style="font-size:10px; padding:3px 8px; background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; border-radius:4px; cursor:pointer; font-family:'Prompt'; margin-top:2px;"><i class="fa-solid fa-trash"></i></button>
                </td>`;
            tbody.appendChild(tr);
        });
    }

    // ── Render Approval table ─────────────────────────────────
    function renderApprovalTable() {
        const tbody = document.getElementById("approval-pending-tbody");
        if (!tbody) return;
        const rows = loadApprovalData();
        const emptyRow = document.getElementById("approval-empty-row");
        tbody.querySelectorAll("tr.approval-data-row").forEach(r => r.remove());
        if (rows.length === 0) {
            if (emptyRow) emptyRow.style.display = "";
            return;
        }
        if (emptyRow) emptyRow.style.display = "none";
        rows.forEach((row, idx) => {
            const tr = document.createElement("tr");
            tr.className = "approval-data-row";
            tr.style.cssText = "border-bottom: 1px solid var(--border-color);";
            tr.innerHTML = `
                <td style="font-size:12px; font-weight:700; color:#7c3aed;">${row.sendDate || '-'}</td>
                <td style="font-size:12px;">${row.hospital || '-'}</td>
                <td style="font-size:12px;">${row.poDate || '-'}</td>
                <td style="font-size:12px;">${row.quotationNo || '-'}</td>
                <td style="font-size:12px; font-weight:600; color:var(--primary-blue);">${row.poNo || '-'}</td>
                <td style="font-size:12px;">${row.jobName || '-'}</td>
                <td style="font-size:12px;">${row.location || '-'}</td>
                <td style="text-align:center;">
                    <button class="btn btn-sm" onclick="openEditApprovalRow(${idx})" style="font-size:10px; padding:3px 8px; background:#ede9fe; color:#6d28d9; border:1px solid #c4b5fd; border-radius:4px; cursor:pointer; font-family:'Prompt';"><i class="fa-solid fa-pen"></i> แก้ไข</button>
                    <button class="btn btn-sm" onclick="deleteApprovalRow(${idx})" style="font-size:10px; padding:3px 8px; background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; border-radius:4px; cursor:pointer; font-family:'Prompt'; margin-top:2px;"><i class="fa-solid fa-trash"></i></button>
                </td>`;
            tbody.appendChild(tr);
        });
    }

    function updateApprovalsDashboard() {
        let total = 0;
        let approved = 0;
        let pending = 0;
        let rejected = 0;
        
        Object.keys(projectsData).forEach(code => {
            const p = projectsData[code];
            if (p.expenses) {
                p.expenses.forEach(e => {
                    if (e.status === "รออนุมัติ") {
                        pending++;
                        total++;
                    } else if (e.status === "อนุมัติแล้ว") {
                        approved++;
                        total++;
                    } else if (e.status === "ปฏิเสธ") {
                        rejected++;
                        total++;
                    }
                });
            }
        });
        
        const totalEl = document.getElementById("kpi-approval-total");
        const approvedEl = document.getElementById("kpi-approval-approved");
        const pendingEl = document.getElementById("kpi-approval-pending");
        const rejectedEl = document.getElementById("kpi-approval-rejected");
        
        if (totalEl) totalEl.textContent = formatNumber(total);
        if (approvedEl) approvedEl.textContent = formatNumber(approved);
        if (pendingEl) pendingEl.textContent = formatNumber(pending);
        if (rejectedEl) rejectedEl.textContent = formatNumber(rejected);
    }

    // ── Render Disbursement Pending table ───────────────────────
    window.setApprovalFilter = function(filterVal) {
        appState.selectedApprovalFilter = filterVal;
        window.renderDisbursementPendingTable();
    };

    window.renderDisbursementPendingTable = function() {
        // Update Approvals Dashboard
        updateApprovalsDashboard();

        const tbody = document.getElementById("disbursement-pending-tbody");
        if (!tbody) return;
        
        tbody.querySelectorAll("tr.disbursement-data-row").forEach(r => r.remove());
        
        // Define active filter
        if (!appState.selectedApprovalFilter) {
            appState.selectedApprovalFilter = "all";
        }
        const activeFilter = appState.selectedApprovalFilter;

        // Apply active class styles to KPI cards
        const cardAll = document.getElementById("btn-approval-filter-all");
        const cardApproved = document.getElementById("btn-approval-filter-approved");
        const cardPending = document.getElementById("btn-approval-filter-pending");
        const cardRejected = document.getElementById("btn-approval-filter-rejected");

        if (cardAll) cardAll.style.boxShadow = activeFilter === "all" ? "0 0 0 2px var(--primary-blue)" : "";
        if (cardApproved) cardApproved.style.boxShadow = activeFilter === "อนุมัติแล้ว" ? "0 0 0 2px var(--status-success)" : "";
        if (cardPending) cardPending.style.boxShadow = activeFilter === "รออนุมัติ" ? "0 0 0 2px var(--status-warning)" : "";
        if (cardRejected) cardRejected.style.boxShadow = activeFilter === "ปฏิเสธ" ? "0 0 0 2px var(--status-danger)" : "";
        
        const list = [];
        Object.keys(projectsData).forEach(code => {
            const p = projectsData[code];
            if (p.expenses) {
                p.expenses.forEach((e, idx) => {
                    // Only display expenses that are part of the approval process
                    if (e.status === "รออนุมัติ" || e.status === "อนุมัติแล้ว" || e.status === "ปฏิเสธ") {
                        if (activeFilter === "all" || e.status === activeFilter) {
                            list.push({ projectCode: code, projectName: p.name, expense: e, expenseIdx: idx });
                        }
                    }
                });
            }
        });

        // Set empty text dynamically based on the current filter
        const emptyLabel = document.querySelector("#disbursement-empty-row div");
        if (emptyLabel) {
            if (activeFilter === "all") {
                emptyLabel.innerHTML = '<i class="fa-solid fa-folder-open" style="font-size: 20px; margin-bottom: 6px; display: block; opacity: 0.5;"></i> ยังไม่มีรายการขอเบิกจ่ายเงินใดๆ';
            } else if (activeFilter === "อนุมัติแล้ว") {
                emptyLabel.innerHTML = '<i class="fa-solid fa-folder-open" style="font-size: 20px; margin-bottom: 6px; display: block; opacity: 0.5;"></i> ไม่มีรายการที่อนุมัติแล้ว';
            } else if (activeFilter === "รออนุมัติ") {
                emptyLabel.innerHTML = '<i class="fa-solid fa-folder-open" style="font-size: 20px; margin-bottom: 6px; display: block; opacity: 0.5;"></i> ไม่มีรายการขอเบิกจ่ายรออนุมัติ';
            } else {
                emptyLabel.innerHTML = '<i class="fa-solid fa-folder-open" style="font-size: 20px; margin-bottom: 6px; display: block; opacity: 0.5;"></i> ไม่มีรายการที่โดนปฏิเสธ';
            }
        }

        const emptyRow = document.getElementById("disbursement-empty-row");
        if (list.length === 0) {
            if (emptyRow) emptyRow.style.display = "";
            return;
        }
        if (emptyRow) emptyRow.style.display = "none";

        list.forEach((item, idx) => {
            const tr = document.createElement("tr");
            tr.className = "disbursement-data-row";
            tr.style.cssText = "border-bottom: 1px solid var(--border-color);";

            const fileHTML = item.expense.file ? 
                `<a href="#" class="btn-expense-view-pdf" data-url="${item.expense.fileUrl || ''}" data-file="${item.expense.file}" title="ดูเอกสาร: ${item.expense.file}" style="color: var(--primary-blue); font-size: 14px; cursor: pointer; text-decoration: none;"><i class="fa-solid fa-file-invoice-dollar"></i> ${item.expense.file}</a>` :
                `<span class="text-muted" style="font-size: 11px;">ไม่มีเอกสารแนบ</span>`;

            let actionHTML = "";
            if (item.expense.status === "รออนุมัติ") {
                actionHTML = `
                    <div style="display: flex; gap: 6px; justify-content: center; align-items: center; padding: 4px;">
                        <button class="btn btn-sm" onclick="approveDisbursement('${item.projectCode}', ${item.expenseIdx})" style="font-size:10px; padding:4px 10px; background:#e6f4ea; color:#137333; border:1px solid #137333; border-radius:4px; cursor:pointer; font-family:'Prompt'; font-weight:bold;"><i class="fa-solid fa-check"></i> อนุมัติ</button>
                        <button class="btn btn-sm" onclick="rejectDisbursement('${item.projectCode}', ${item.expenseIdx})" style="font-size:10px; padding:4px 10px; background:#fce8e6; color:#c5221f; border:1px solid #c5221f; border-radius:4px; cursor:pointer; font-family:'Prompt'; font-weight:bold;"><i class="fa-solid fa-xmark"></i> ปฏิเสธ</button>
                    </div>
                `;
            } else if (item.expense.status === "อนุมัติแล้ว") {
                actionHTML = `
                    <span style="display: inline-block; color: #137333; font-weight: bold; background: #e6f4ea; padding: 4px 8px; border-radius: 4px; border: 1px solid #137333; font-size: 10px;"><i class="fa-solid fa-circle-check"></i> อนุมัติแล้ว</span>
                `;
            } else {
                actionHTML = `
                    <span style="display: inline-block; color: #c5221f; font-weight: bold; background: #fce8e6; padding: 4px 8px; border-radius: 4px; border: 1px solid #c5221f; font-size: 10px;" title="เหตุผล: ${item.expense.rejectReason || ''}"><i class="fa-solid fa-circle-xmark"></i> ปฏิเสธแล้ว</span>
                `;
            }

            tr.innerHTML = `
                <td style="font-size:12px; font-weight:700; color:#0f52ba;">${item.expense.date}</td>
                <td style="font-size:12px;"><strong>[${item.projectCode}]</strong> ${item.projectName}</td>
                <td style="font-size:12px;">${item.expense.title}</td>
                <td style="font-size:12px;"><span class="badge-status ${item.expense.type === "ค่าแรง" ? "success" : "warning"}">${item.expense.type}</span></td>
                <td style="font-size:12px;">${fileHTML}</td>
                <td style="font-size:12px; font-weight:600; color:var(--primary-blue); text-align:right;">${formatNumber(item.expense.amount)} บาท</td>
                <td style="text-align:center;">${actionHTML}</td>`;
            tbody.appendChild(tr);
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
    };

    window.approveDisbursement = function(projCode, expIdx) {
        const proj = projectsData[projCode];
        if (!proj || !proj.expenses || !proj.expenses[expIdx]) return;

        if (confirm(`คุณต้องการอนุมัติการเบิกจ่ายงบประมาณ "${proj.expenses[expIdx].title}" จำนวน ${formatNumber(proj.expenses[expIdx].amount)} บาท ใช่หรือไม่?`)) {
            proj.expenses[expIdx].status = "อนุมัติแล้ว";
            
            recalculateCostStructure(proj);
            saveToLocalStorage();
            
            window.renderDisbursementPendingTable();
            if (appState.selectedDetailProject === projCode) {
                renderSubnavProjectWorkspace();
            }
            renderCostManagement();
            renderOverallDashboard();
            updateBellBadge();
            
            showToast("อนุมัติการเบิกจ่ายงบประมาณเรียบร้อยแล้ว", "success");
        }
    };

    window.rejectDisbursement = function(projCode, expIdx) {
        const proj = projectsData[projCode];
        if (!proj || !proj.expenses || !proj.expenses[expIdx]) return;

        const reason = prompt("กรุณาระบุเหตุผลในการปฏิเสธคำขอเบิกเงิน:", "");
        if (reason === null) return;

        const finalReason = reason.trim() || "ไม่ผ่านการอนุมัติโดยบัญชี";
        proj.expenses[expIdx].status = "ปฏิเสธ";
        proj.expenses[expIdx].rejectReason = finalReason;
        
        recalculateCostStructure(proj);
        saveToLocalStorage();
        
        window.renderDisbursementPendingTable();
        if (appState.selectedDetailProject === projCode) {
            renderSubnavProjectWorkspace();
        }
        renderCostManagement();
        renderOverallDashboard();
        updateBellBadge();
        
        showToast(`ปฏิเสธคำขอเบิกจ่ายเรียบร้อยแล้ว (เหตุผล: ${finalReason})`, "warning");
    };

    function updateDisbursementNotifications() {
        const body = document.getElementById("notif-dropdown-body");
        if (!body) return;

        body.querySelectorAll(".disbursement-notif-item, .disbursement-response-notif-item").forEach(el => el.remove());

        Object.keys(projectsData).forEach(code => {
            const p = projectsData[code];
            if (p.expenses) {
                p.expenses.forEach((e, idx) => {
                    if (e.status === "รออนุมัติ") {
                        const div = document.createElement("div");
                        div.className = "notif-item unread disbursement-notif-item";
                        div.setAttribute("data-notif-type", "approval");
                        
                        const notifId = `drawdown-${code}-${idx}`;
                        
                        const ack = getAcknowledged();
                        if (ack.includes(notifId)) return;
                        
                        div.innerHTML = `
                            <div class="notif-icon cost" style="background: rgba(15, 82, 186, 0.1); color: #0f52ba;"><i class="fa-solid fa-paper-plane"></i></div>
                            <div class="notif-content">
                                <p class="notif-text">ขออนุมัติเบิกงบ: <strong>[${code}] ${e.title}</strong> (${formatNumber(e.amount)} บาท)</p>
                                <span class="notif-time">${e.date}</span>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <button class="btn-drawdown-detail" onclick="acknowledgeDisbursementNotif('${notifId}', '${code}')"><i class="fa-solid fa-arrow-right mr-1"></i>ตรวจสอบคำขอ</button>
                                    <button class="btn-delete-notif" data-notif-id="${notifId}" title="ลบการแจ้งเตือน"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                            </div>
                        `;
                        
                        // Hide from non-accounting roles
                        if (appState.currentRole !== "accounting") {
                            div.style.display = "none";
                        }
                        
                        body.insertBefore(div, body.firstChild);
                    } else if (e.status === "อนุมัติแล้ว" || e.status === "ปฏิเสธ") {
                        const isApproved = e.status === "อนุมัติแล้ว";
                        const notifId = `drawdown-response-${code}-${idx}-${e.status}`;
                        
                        const ack = getAcknowledged();
                        if (ack.includes(notifId)) return;
                        
                        const div = document.createElement("div");
                        div.className = "notif-item unread disbursement-response-notif-item general-notif";
                        div.setAttribute("data-notif-type", "general");
                        
                        const statusText = isApproved ? "ได้รับการอนุมัติแล้ว" : `ถูกปฏิเสธ (เหตุผล: ${e.rejectReason || 'ไม่ระบุ'})`;
                        const statusColor = isApproved ? "#137333" : "#c5221f";
                        const statusBg = isApproved ? "rgba(19, 115, 51, 0.1)" : "rgba(197, 34, 31, 0.1)";
                        const icon = isApproved ? "fa-circle-check" : "fa-circle-xmark";
                        
                        div.innerHTML = `
                            <div class="notif-icon" style="background: ${statusBg}; color: ${statusColor};"><i class="fa-solid ${icon}"></i></div>
                            <div class="notif-content">
                                <p class="notif-text">คำขอเบิกเงิน <strong>[${code}] ${e.title}</strong> (${formatNumber(e.amount)} บาท) ${statusText}</p>
                                <span class="notif-time">${e.date}</span>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <button class="btn-drawdown-detail" onclick="acknowledgeResponseNotif('${notifId}', '${code}')"><i class="fa-solid fa-arrow-right mr-1"></i>ดูรายละเอียด</button>
                                    <button class="btn-delete-notif" data-notif-id="${notifId}" title="ลบการแจ้งเตือน"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                            </div>
                        `;
                        
                        // Hide from accounting role
                        if (appState.currentRole === "accounting") {
                            div.style.display = "none";
                        }
                        
                        body.insertBefore(div, body.firstChild);
                    }
                });
            }
        });
    }

    window.acknowledgeDisbursementNotif = function(notifId, projectCode) {
        // Set selected cost project
        updateSelectedCostProject(projectCode);
        
        // Update cost-project-selector dropdown value
        const costSelector = document.getElementById("cost-project-selector");
        if (costSelector) {
            costSelector.value = projectCode;
        }
        
        // Navigate to the Cost view
        if (typeof switchView === "function") {
            switchView("cost");
        }
        
        // Select the main approvals tab
        if (typeof switchCostMainTab === "function") {
            switchCostMainTab("approvals");
        }

        // Close dropdown
        const dropdown = document.getElementById("notification-dropdown");
        if (dropdown) dropdown.classList.remove("active");
    };

    window.acknowledgeResponseNotif = function(notifId, projectCode) {
        markAcknowledged(notifId);
        
        // Set selected project
        appState.selectedDetailProject = projectCode;
        sessionStorage.setItem("technical_water_last_detail_project", projectCode);
        
        // Switch active tab in project details to cost-tab
        appState.activeProjectTab = "cost-tab";
        appState.selectedGalleryFolder = null;
        
        // Sync dropdown selector
        const projSelector = document.getElementById("subnav-project-selector");
        if (projSelector) projSelector.value = projectCode;
        
        // Go to projects-list view
        if (typeof switchView === "function") {
            switchView("projects-list");
        }
        
        // Render details workspace
        if (typeof renderSubnavProjectWorkspace === "function") {
            renderSubnavProjectWorkspace();
        }

        // Close the notification dropdown
        const notifDropdown = document.getElementById("notification-dropdown");
        if (notifDropdown) notifDropdown.classList.remove("active");
        
        updateBellBadge();
    };

    // ── Modal HTML factory ────────────────────────────────────
    function buildRowModal(title, accentColor, fields, onSave) {
        const existing = document.getElementById("dynamic-row-modal");
        if (existing) existing.remove();
        const modal = document.createElement("div");
        modal.id = "dynamic-row-modal";
        modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;";
        const inner = document.createElement("div");
        inner.style.cssText = `background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.2);padding:28px 32px;width:580px;max-width:96vw;max-height:90vh;overflow-y:auto;font-family:'Prompt',sans-serif;`;
        inner.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                <h3 style="font-size:15px;font-weight:800;color:#1e293b;margin:0;">${title}</h3>
                <button id="close-row-modal" style="background:none;border:none;font-size:18px;cursor:pointer;color:#94a3b8;">✕</button>
            </div>
            <div id="modal-fields-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;"></div>
            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;border-top:1px solid #e2e8f0;padding-top:16px;">
                <button id="cancel-row-modal" class="btn btn-outline" style="font-family:'Prompt';font-size:12px;padding:8px 20px;">ยกเลิก</button>
                <button id="save-row-modal" class="btn btn-primary" style="font-family:'Prompt';font-size:12px;padding:8px 24px;background:${accentColor};border-color:${accentColor};">
                    <i class="fa-solid fa-floppy-disk mr-1"></i>บันทึก
                </button>
            </div>`;
        const grid = inner.querySelector("#modal-fields-grid");
        fields.forEach(f => {
            const g = document.createElement("div");
            g.style.cssText = f.full ? "grid-column:1/-1;" : "";
            const isHosp = (f.key === "hospital");
            const listAttr = isHosp ? 'list="all-hospitals-datalist" autocomplete="off"' : '';
            g.innerHTML = `<label style="font-size:11px;font-weight:700;color:#475569;display:block;margin-bottom:4px;">${f.label}</label>
                <input id="mf-${f.key}" type="text" placeholder="${f.placeholder || ''}" value="${f.value || ''}" ${listAttr}
                    style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:6px;font-family:'Prompt';font-size:12px;outline:none;box-sizing:border-box;">`;
            grid.appendChild(g);
        });
        modal.appendChild(inner);
        document.body.appendChild(modal);
        const close = () => modal.remove();
        inner.querySelector("#close-row-modal").onclick = close;
        inner.querySelector("#cancel-row-modal").onclick = close;
        modal.addEventListener("click", e => { if (e.target === modal) close(); });
        inner.querySelector("#save-row-modal").onclick = () => {
            const vals = {};
            fields.forEach(f => { vals[f.key] = document.getElementById("mf-" + f.key)?.value?.trim() || ""; });
            onSave(vals);
            close();
        };
    }

    const PO_FIELDS = [
        { key:"hospital",    label:"โรงพยาบาล",           placeholder:"เช่น พญาไท 2" },
        { key:"poDate",      label:"วันที่ PO ออก",         placeholder:"เช่น 15/7/68" },
        { key:"quotationNo", label:"เลขที่ใบเสนอราคา",     placeholder:"เช่น TW-68-907" },
        { key:"poNo",        label:"เลขที่ใบสั่งซื้อ / PO", placeholder:"เช่น 22025011142" },
        { key:"jobName",     label:"ชื่องาน",               placeholder:"ระบุชื่องาน...", full:true },
        { key:"location",    label:"สถานที่",               placeholder:"เช่น ชั้น 15 อาคาร A" },
    ];

    const APPROVAL_FIELDS = [
        { key:"sendDate",    label:"วันที่ส่งหนังสือมอบงาน", placeholder:"เช่น 17/7/2569" },
        { key:"hospital",    label:"โรงพยาบาล",             placeholder:"เช่น พญาไท 3" },
        { key:"poDate",      label:"วันที่ PO ออก",          placeholder:"เช่น 24/3/69" },
        { key:"quotationNo", label:"เลขที่ใบเสนอราคา",      placeholder:"เช่น TW-69-040 R.2" },
        { key:"poNo",        label:"เลขที่ใบสั่งซื้อ / PO",  placeholder:"เช่น 23026003554" },
        { key:"jobName",     label:"ชื่องาน",                placeholder:"ระบุชื่องาน...", full:true },
        { key:"location",    label:"สถานที่",                placeholder:"เช่น อาคาร A ชั้น 3" },
    ];

    // ── Global edit/delete functions ──────────────────────────
    window.openEditPORow = function(idx) {
        const data = loadPOData();
        const row = data[idx] || {};
        buildRowModal("✏️ แก้ไขรายการ PO ค้าง", "#1d4ed8",
            PO_FIELDS.map(f => ({ ...f, value: row[f.key] || "" })),
            (vals) => { data[idx] = vals; savePOData(data); renderPOTable(); });
    };
    window.deletePORow = function(idx) {
        if (!confirm("ยืนยันการลบรายการ PO ค้างนี้?")) return;
        const data = loadPOData(); data.splice(idx, 1); savePOData(data); renderPOTable();
    };
    window.openEditApprovalRow = function(idx) {
        const data = loadApprovalData();
        const row = data[idx] || {};
        buildRowModal("✏️ แก้ไขรายการงานรออนุมัติ", "#7c3aed",
            APPROVAL_FIELDS.map(f => ({ ...f, value: row[f.key] || "" })),
            (vals) => { data[idx] = vals; saveApprovalData(data); renderApprovalTable(); });
    };
    window.deleteApprovalRow = function(idx) {
        if (!confirm("ยืนยันการลบรายการนี้?")) return;
        const data = loadApprovalData(); data.splice(idx, 1); saveApprovalData(data); renderApprovalTable();
    };

    // ── Add-row buttons ───────────────────────────────────────
    document.addEventListener("click", function(e) {
        if (e.target.closest("#btn-add-po-row")) {
            buildRowModal("➕ เพิ่มรายการ PO ค้าง", "#1d4ed8", PO_FIELDS, (vals) => {
                const data = loadPOData(); data.push(vals); savePOData(data); renderPOTable();
            });
        }
        if (e.target.closest("#btn-add-approval-row")) {
            buildRowModal("➕ เพิ่มรายการงานรออนุมัติ", "#7c3aed", APPROVAL_FIELDS, (vals) => {
                const data = loadApprovalData(); data.push(vals); saveApprovalData(data); renderApprovalTable();
            });
        }
    });

    // ── Acknowledge notification buttons ──────────────────────
    const acknowledgedKey = "tw_acknowledged_notifs";
    function getAcknowledged() { return JSON.parse(localStorage.getItem(acknowledgedKey) || "[]"); }
    function markAcknowledged(id) {
        const ack = getAcknowledged(); if (!ack.includes(id)) ack.push(id);
        localStorage.setItem(acknowledgedKey, JSON.stringify(ack));
    }

    document.addEventListener("click", function(e) {
        // 0. Delete notification button click
        const btnDelete = e.target.closest(".btn-delete-notif");
        if (btnDelete) {
            e.stopPropagation();
            const notifId = btnDelete.getAttribute("data-notif-id");
            const item = btnDelete.closest(".notif-item");
            if (item) {
                item.style.opacity = "0";
                item.style.transform = "translateX(30px)";
                item.style.transition = "all 0.3s ease";
                setTimeout(() => {
                    item.remove();
                    updateBellBadge();
                }, 300);
                
                if (notifId) {
                    markAcknowledged(notifId);
                }
            }
            return;
        }

        // 1. Acknowledge button click
        const btnAck = e.target.closest(".btn-acknowledge");
        if (btnAck) {
            e.stopPropagation();
            const notifId = btnAck.getAttribute("data-notif-id");
            const item = btnAck.closest(".notif-item");
            if (item) {
                item.classList.remove("unread");
                item.style.opacity = "0.5";
                btnAck.disabled = true;
                btnAck.innerHTML = '<i class="fa-solid fa-check-double mr-1"></i>รับทราบแล้ว';
                markAcknowledged(notifId);
                updateBellBadge();
            }
            return;
        }

        // 2. View details button click inside notification dropdown
        const btnDetail = e.target.closest(".btn-view-detail") || (e.target.closest("button") && e.target.closest("button").textContent.includes("ดูรายละเอียด"));
        if (btnDetail) {
            e.stopPropagation();
            e.preventDefault();
            
            // Extract project code (e.g. "PO-1111" from "ขออนุมัติเปิดงบ: [PO-1111] ซื้อคอม")
            let projectCode = btnDetail.getAttribute("data-project-code") || btnDetail.getAttribute("data-code");
            let isDrawdown = false;
            const notifItem = btnDetail.closest(".notif-item");
            if (notifItem) {
                const text = notifItem.innerText || notifItem.textContent;
                if (text.includes("ขออนุมัติเบิกงบ")) {
                    isDrawdown = true;
                }
                if (!projectCode) {
                    const match = text.match(/\[([A-Z0-9-]+)\]/i);
                    if (match && match[1]) {
                        projectCode = match[1];
                    }
                }
            }
            
            if (projectCode) {
                let matchedCode = null;
                const searchCode = projectCode.trim().toLowerCase();
                for (const key in projectsData) {
                    if (key.toLowerCase() === searchCode) {
                        matchedCode = key;
                        break;
                    }
                }
                
                if (matchedCode) {
                    // Close the notification dropdown
                    const notifDropdown = document.getElementById("notification-dropdown");
                    if (notifDropdown) notifDropdown.classList.remove("active");
                    
                    if (isDrawdown) {
                        // Set selected cost project
                        updateSelectedCostProject(matchedCode);
                        
                        // Update cost-project-selector dropdown value
                        const costSelector = document.getElementById("cost-project-selector");
                        if (costSelector) {
                            costSelector.value = matchedCode;
                        }
                        
                        // Navigate to the Cost view
                        if (typeof switchView === "function") {
                            switchView("cost");
                        }
                        
                        // Open the pending approvals tab in Cost Management
                        const tabBtn = document.querySelector(".cost-tab-btn[data-cost-tab='approval-pending']");
                        if (tabBtn) {
                            tabBtn.click();
                        }
                        showToast(`📂 เปิดรายละเอียดการเบิกงบโครงการ ${matchedCode} สำเร็จ`, "success");
                    } else {
                        // Set selected project
                        appState.selectedDetailProject = matchedCode;
                        sessionStorage.setItem("technical_water_last_detail_project", matchedCode);
                        
                        // Sync dropdown selector
                        const projSelector = document.getElementById("subnav-project-selector");
                        if (projSelector) projSelector.value = matchedCode;
                        
                        // Go to projects-list view
                        if (typeof switchView === "function") {
                            switchView("projects-list");
                        }
                        
                        // Render details workspace
                        if (typeof renderSubnavProjectWorkspace === "function") {
                            renderSubnavProjectWorkspace();
                        }
                        
                        showToast(`📂 เปิดรายละเอียดโครงการ ${matchedCode} สำเร็จ`, "success");
                    }
                } else {
                    showToast(`ไม่พบรหัสโครงการ ${projectCode} ในฐานข้อมูล`, "warning");
                }
            } else {
                showToast("ไม่พบข้อมูลโครงการสำหรับการแจ้งเตือนนี้", "warning");
            }
        }
    });

    function updateBellBadge() {
        const badge = document.getElementById("bell-badge-count");
        if (badge) {
            if (typeof updateDisbursementNotifications === "function") {
                updateDisbursementNotifications();
            }

            const unread = Array.from(document.querySelectorAll(".notif-item.unread:not([style*='opacity: 0.5'])"))
                                .filter(el => el.style.display !== "none");
            const count = unread.length;
            badge.textContent = count;
            badge.style.display = count > 0 ? "" : "none";
        }

        // Update approvals-badge-count dynamically on the Approvals tab
        const approvalBadge = document.getElementById("approvals-badge-count");
        if (approvalBadge) {
            let pendingCount = 0;
            Object.keys(projectsData).forEach(code => {
                const p = projectsData[code];
                if (p.expenses) {
                    p.expenses.forEach(e => {
                        if (e.status === "รออนุมัติ") {
                            pendingCount++;
                        }
                    });
                }
            });
            approvalBadge.textContent = pendingCount;
            approvalBadge.style.display = pendingCount > 0 ? "inline-block" : "none";
        }
    }

    // ── Role-based notification filtering ─────────────────────
    window.applyNotifRoleFilter = function(role) {
        const generalNotifs = document.querySelectorAll(".general-notif");
        const approvalNotifs = document.querySelectorAll(".approval-notif, .disbursement-notif-item");
        const header = document.getElementById("notif-header-label");
        
        if (role === "accounting") {
            // Accounting sees ONLY approval notifications
            generalNotifs.forEach(el => el.style.display = "none");
            approvalNotifs.forEach(el => el.style.display = "");
            if (header) {
                header.textContent = "การแจ้งเตือน: งานรออนุมัติ";
            }
        } else {
            // PM and other roles see ONLY general notifications
            generalNotifs.forEach(el => el.style.display = "");
            approvalNotifs.forEach(el => el.style.display = "none");
            if (header) {
                header.textContent = "การแจ้งเตือนล่าสุด";
            }
        }
        updateBellBadge();
    };

    // Initial render when DOM is ready
    renderPOTable();
    renderApprovalTable();
    if (window.renderDisbursementPendingTable) {
        window.renderDisbursementPendingTable();
    }
    // Apply acknowledged state from storage
    const ack = getAcknowledged();
    ack.forEach(id => {
        const btn = document.querySelector(`.btn-acknowledge[data-notif-id="${id}"], .btn-delete-notif[data-notif-id="${id}"]`);
        if (btn) {
            const item = btn.closest(".notif-item");
            if (item) { item.remove(); }
        }
    });
    updateBellBadge();

})();

// ============================================================
// FORM DRAFT AUTO-SAVE SYSTEM
// Saves all modal form inputs to sessionStorage on every input event.
// Restores drafts when modals are opened again.
// Cleared after successful form submission.
// ============================================================

const FORM_DRAFTS = {
    // formId -> { fieldId: value, ... }
};

// Map of modal open buttons/IDs to their form IDs and fields
const MODAL_FORM_MAP = [
    {
        modalId: "task-modal",
        formId: "add-task-form",
        draftKey: "draft_task",
        fields: ["task-title-input", "task-start-input", "task-end-input", "task-progress-input"]
    },
    {
        modalId: "plan-modal",
        formId: "add-plan-form",
        draftKey: "draft_plan",
        fields: ["plan-title-input", "plan-quarter-input", "plan-duration-input", "plan-color-input"]
    },
    {
        modalId: "daily-report-modal",
        formId: "add-daily-report-form",
        draftKey: "draft_daily_report",
        fields: ["report-date", "report-desc"]
    },
    {
        modalId: "expense-modal",
        formId: "add-expense-form",
        draftKey: "draft_expense",
        fields: ["exp-date", "exp-type", "exp-title", "exp-amount"]
    },
    {
        modalId: "create-project-modal",
        formId: "create-project-form",
        draftKey: "draft_create_project",
        fields: [
            "new-project-code", "new-project-name", "new-project-customer",
            "new-project-manager", "new-project-start", "new-project-end",
            "new-project-value", "new-project-cost", "new-project-year",
            "new-project-status", "new-project-desc"
        ]
    },
    {
        modalId: "upload-modal",
        formId: "add-doc-form",
        draftKey: "draft_upload_doc",
        fields: ["doc-name", "doc-type", "doc-date"]
    },
    {
        modalId: "media-upload-modal",
        formId: "add-media-form",
        draftKey: "draft_media",
        fields: ["media-title", "media-date"]
    }
];

function saveDraft(draftKey, fields) {
    const draft = {};
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) draft[id] = el.value;
    });
    sessionStorage.setItem(draftKey, JSON.stringify(draft));
}

function restoreDraft(draftKey, fields) {
    try {
        const raw = sessionStorage.getItem(draftKey);
        if (!raw) return false;
        const draft = JSON.parse(raw);
        let hasData = false;
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el && draft[id] !== undefined && draft[id] !== "") {
                el.value = draft[id];
                hasData = true;
            }
        });
        return hasData;
    } catch { return false; }
}

function clearDraft(draftKey) {
    sessionStorage.removeItem(draftKey);
}

function showDraftBadge(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const existing = modal.querySelector(".draft-restored-badge");
    if (existing) return;
    const header = modal.querySelector(".modal-header");
    if (!header) return;
    const badge = document.createElement("div");
    badge.className = "draft-restored-badge";
    badge.innerHTML = `<i class="fa-solid fa-rotate-left" style="margin-right:4px;"></i>กู้คืนข้อมูลที่กรอกไว้`;
    badge.style.cssText = "font-size:11px;color:#0d9488;font-weight:600;background:#f0fdf4;border:1px solid #6ee7b7;border-radius:4px;padding:3px 8px;margin-top:6px;display:inline-flex;align-items:center;";
    header.appendChild(badge);
    setTimeout(() => badge.remove(), 4000);
}

// Attach auto-save and restore to all forms after DOM is ready
(function initDraftSystem() {
    MODAL_FORM_MAP.forEach(({ modalId, formId, draftKey, fields }) => {
        const modal = document.getElementById(modalId);
        const form = document.getElementById(formId);
        if (!modal || !form) return;

        // Restore draft when modal becomes visible (use MutationObserver)
        const observer = new MutationObserver(() => {
            if (modal.classList.contains("active") || modal.style.display === "flex" || modal.style.display === "block") {
                const restored = restoreDraft(draftKey, fields);
                if (restored) showDraftBadge(modalId);
            }
        });
        observer.observe(modal, { attributes: true, attributeFilter: ["class", "style"] });

        // Auto-save on every input change
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener("input", () => saveDraft(draftKey, fields));
            el.addEventListener("change", () => saveDraft(draftKey, fields));
        });

        // Clear draft on successful form submit
        form.addEventListener("submit", () => {
            clearDraft(draftKey);
            const existing = modal.querySelector(".draft-restored-badge");
            if (existing) existing.remove();
        });

        // Clear draft when cancel button inside modal is clicked
        const cancelBtns = modal.querySelectorAll("[id^='cancel-'], .modal-close-btn");
        cancelBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                // Don't auto-clear draft on cancel — let user keep it
            });
        });
    });
})();



