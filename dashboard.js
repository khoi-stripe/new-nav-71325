// Dashboard functionality with account-specific sandbox management
class Dashboard {
    constructor() {
        this.currentOpenPanel = null;
        this.panels = document.querySelectorAll('.nav-panel');
        this.currentActiveAccount = null;
        this.accountSandboxes = this.loadAccountSandboxes();
        this.organizationSandboxes = this.loadOrganizationSandboxes();
        this.organizationAccounts = this.getOrganizationAccounts();
        
        // Cache frequently used DOM elements
        this.domCache = {
            activeAccount: null,
            dashboardTitle: null,
            accountSubtitle: null,
            accountSwitcherText: null,
            accountSwitcher: null,
            sandboxIndicatorBar: null,
            sandboxList: null,
            sandboxPopoverItems: null,
            accountPopoverItems: null,
            dashboard: null
        };
        
        this.init();
    }

    // Initialize DOM cache
    initDOMCache() {
        this.domCache.activeAccount = document.getElementById('active-account');
        this.domCache.dashboardTitle = document.getElementById('dashboardTitle');
        this.domCache.accountSubtitle = document.getElementById('accountSubtitle');
        this.domCache.accountSwitcherText = document.getElementById('accountSwitcherText');
        this.domCache.accountSwitcher = document.getElementById('accountSwitcher');
        this.domCache.sandboxIndicatorBar = document.getElementById('sandboxIndicatorBar');
        this.domCache.sandboxList = document.getElementById('sandbox-list');
        this.domCache.dashboard = document.querySelector('.dashboard');
    }

    // Get cached DOM element or query if not cached
    getElement(key, selector) {
        if (!this.domCache[key]) {
            this.domCache[key] = document.querySelector(selector);
        }
        return this.domCache[key];
    }

    init() {
        // Initialize DOM cache
        this.initDOMCache();
        
        // Add event listeners for panel toggles
        this.panels.forEach(panel => {
            const toggle = panel.querySelector('.panel-toggle');
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.togglePanel(panel.id);
                });
            }
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllPanels();
            }
        });

        // Initialize account tracking
        this.initializeAccountTracking();
    }

    // Get organization accounts mapping
    getOrganizationAccounts() {
        return {
            'acme-inc': [
                { name: 'Acme Eats US', initials: 'AE', color: 'color-1' },
                { name: 'Acme Eats UK', initials: 'AE', color: 'color-2' },
                { name: 'Acme Deliveries US', initials: 'AD', color: 'color-3' },
                { name: 'Acme Deliveries Canada', initials: 'AD', color: 'color-4' },
                { name: 'Acme Rides US', initials: 'AR', color: 'color-5' },
                { name: 'Acme Rides Europe', initials: 'AR', color: 'color-6' },
                { name: 'Acme Financial Services', initials: 'AF', color: 'color-1' },
                { name: 'Acme Technology Division', initials: 'AT', color: 'color-2' }
            ],
            'lil-fatsos': [
                { name: 'Lil\'Fatsos Downtown', initials: 'LD', color: 'color-1' },
                { name: 'Lil\'Fatsos Midtown', initials: 'LM', color: 'color-2' },
                { name: 'Lil\'Fatsos Westside', initials: 'LW', color: 'color-3' },
                { name: 'Lil\'Fatsos Airport', initials: 'LA', color: 'color-4' }
            ]
        };
    }

    // Initialize account tracking and sandbox management
    initializeAccountTracking() {
        const activeAccount = this.domCache.activeAccount;
        if (activeAccount) {
            this.currentActiveAccount = activeAccount.dataset.accountName;
            this.updateSandboxesForAccount(this.currentActiveAccount);
        }

        // Watch for account changes
        const accountObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-account-name') {
                    const newAccount = mutation.target.dataset.accountName;
                    if (newAccount !== this.currentActiveAccount) {
                        this.currentActiveAccount = newAccount;
                        this.updateSandboxesForAccount(newAccount);
                        console.log('Account switched to:', newAccount);
                    }
                }
            });
        });

        if (activeAccount) {
            accountObserver.observe(activeAccount, {
                attributes: true,
                attributeFilter: ['data-account-name']
            });
        }
    }

    // Load account sandboxes from localStorage
    loadAccountSandboxes() {
        const stored = localStorage.getItem('accountSandboxes');
        return stored ? JSON.parse(stored) : {};
    }

    // Load organization sandboxes from localStorage
    loadOrganizationSandboxes() {
        const stored = localStorage.getItem('organizationSandboxes');
        return stored ? JSON.parse(stored) : {};
    }

    // Save account sandboxes to localStorage
    saveAccountSandboxes() {
        localStorage.setItem('accountSandboxes', JSON.stringify(this.accountSandboxes));
    }

    // Save organization sandboxes to localStorage
    saveOrganizationSandboxes() {
        localStorage.setItem('organizationSandboxes', JSON.stringify(this.organizationSandboxes));
    }

    // Get sandboxes for a specific account
    getSandboxesForAccount(accountName) {
        if (!this.accountSandboxes[accountName]) {
            this.accountSandboxes[accountName] = this.getDefaultSandboxes(accountName);
            this.saveAccountSandboxes();
        }
        return this.accountSandboxes[accountName];
    }

    // Get organization sandboxes for a specific organization
    getOrganizationSandboxesForOrganization(organizationId) {
        if (!this.organizationSandboxes[organizationId]) {
            this.organizationSandboxes[organizationId] = this.getDefaultOrganizationSandboxes(organizationId);
            this.saveOrganizationSandboxes();
        }
        return this.organizationSandboxes[organizationId];
    }

    // Get default sandboxes for an account
    getDefaultSandboxes(accountName) {
        return [
            {
                name: 'Development Testing',
                type: 'account',
                created: new Date().toISOString(),
                accounts: [accountName]
            },
            {
                name: 'Feature Preview',
                type: 'account',
                created: new Date().toISOString(),
                accounts: [accountName]
            },
            {
                name: 'Performance Testing',
                type: 'account',
                created: new Date().toISOString(),
                accounts: [accountName]
            }
        ];
    }

    // Get default organization sandboxes
    getDefaultOrganizationSandboxes(organizationId) {
        const orgAccounts = this.organizationAccounts[organizationId] || [];
        const accountNames = orgAccounts.map(acc => acc.name);
        
        return [
            {
                name: 'Q3 Planning',
                type: 'organization',
                created: new Date().toISOString(),
                accounts: accountNames,
                organizationId: organizationId
            },
            {
                name: 'Beta Features',
                type: 'organization',
                created: new Date().toISOString(),
                accounts: accountNames,
                organizationId: organizationId
            },
            {
                name: 'Holiday Campaign',
                type: 'organization',
                created: new Date().toISOString(),
                accounts: accountNames,
                organizationId: organizationId
            }
        ];
    }

    // Get organization name from ID
    getOrganizationName(organizationId) {
        const orgNames = {
            'acme-inc': 'Acme Inc',
            'lil-fatsos': 'Lil\'Fatsos'
        };
        return orgNames[organizationId] || organizationId;
    }

    // Update sandboxes for current account
    updateSandboxesForAccount(accountName) {
        const sandboxList = this.domCache.sandboxList;
        if (!sandboxList) return;

        // Clear existing sandboxes
        sandboxList.innerHTML = '';

        // Get sandboxes for this account
        const accountSandboxes = this.getSandboxesForAccount(accountName);

        // Get organization sandboxes if account is part of an organization
        const activeAccount = this.domCache.activeAccount;
        let organizationSandboxes = [];
        if (activeAccount && activeAccount.dataset.organization) {
            const organizationId = activeAccount.dataset.organization;
            organizationSandboxes = this.getOrganizationSandboxesForOrganization(organizationId);
        }

        // Combine all sandboxes
        const allSandboxes = [...organizationSandboxes, ...accountSandboxes];

        // Create sandbox items
        allSandboxes.forEach((sandbox, index) => {
            const sandboxItem = this.createSandboxItem(sandbox, index);
            sandboxList.appendChild(sandboxItem);
        });

        // Update animation delays
        this.updateAnimationDelays(sandboxList);

        // Update popover items
        this.updatePopoverItems(allSandboxes);
    }

    // Optimized method to update popover items
    updatePopoverItems(sandboxes) {
        // Cache popover containers
        const sandboxPopover = this.getElement('sandboxPopover', '.sandbox-popover-content');
        const accountPopover = this.getElement('accountPopover', '.account-popover-content');
        
        if (sandboxPopover) {
            this.updateSandboxPopoverItems(sandboxPopover, sandboxes);
        }
        
        if (accountPopover) {
            this.updateAccountPopoverItems(accountPopover, sandboxes);
        }
    }

    // Update sandbox popover items
    updateSandboxPopoverItems(container, sandboxes) {
        const existingItems = container.querySelectorAll('.sandbox-popover-item');
        existingItems.forEach(item => item.remove());
        
        sandboxes.forEach((sandbox, index) => {
            const item = this.createSandboxPopoverItem(sandbox, index);
            container.appendChild(item);
        });
        
        this.updatePopoverAnimationDelays(container);
    }

    // Update account popover items
    updateAccountPopoverItems(container, sandboxes) {
        const existingItems = container.querySelectorAll('.account-popover-item.sandbox-item');
        existingItems.forEach(item => item.remove());
        
        sandboxes.forEach((sandbox, index) => {
            const item = this.createAccountPopoverSandboxItem(sandbox, index);
            container.appendChild(item);
        });
    }

    // Create sandbox item element
    createSandboxItem(sandbox, index) {
        const item = document.createElement('div');
        item.className = `sandbox-item ${sandbox.type}`;
        item.innerHTML = `
            <div class="sandbox-header">
                <div class="sandbox-icon ${sandbox.type}-icon">
                    <div class="icon">
                        ${sandbox.type === 'organization' ? 
                            '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 0L10.5 5.5H16L11.5 9L13 14.5L8 11L3 14.5L4.5 9L0 5.5H5.5L8 0Z" fill="currentColor"/></svg>' :
                            '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 0C10.21 0 12 1.79 12 4C12 6.21 10.21 8 8 8C5.79 8 4 6.21 4 4C4 1.79 5.79 0 8 0ZM8 10C12.42 10 16 11.79 16 14V16H0V14C0 11.79 3.58 10 8 10Z" fill="currentColor"/></svg>'
                        }
                    </div>
                </div>
                <div class="sandbox-info">
                    <div class="sandbox-name">${sandbox.name}</div>
                    <div class="sandbox-meta">
                        ${sandbox.type === 'organization' ? 'Organization' : 'Account'} • 
                        ${new Date(sandbox.created).toLocaleDateString()}
                    </div>
                </div>
            </div>
            <div class="sandbox-accounts">
                ${sandbox.accounts.slice(0, 3).map(accountName => {
                    const account = this.getAccountByName(accountName);
                    return `<div class="mini-account-avatar ${account.color}">${account.initials}</div>`;
                }).join('')}
                ${sandbox.accounts.length > 3 ? 
                    `<div class="account-count">+${sandbox.accounts.length - 3}</div>` : 
                    ''
                }
            </div>
            <div class="sandbox-actions">
                <button class="enter-sandbox-btn" onclick="dashboard.enterSandboxMode(${JSON.stringify(sandbox).replace(/"/g, '&quot;')})">
                    Enter Sandbox
                </button>
                <button class="delete-sandbox-btn" onclick="dashboard.deleteSandbox('${sandbox.name}')">
                    Delete
                </button>
            </div>
        `;
        return item;
    }

    // Create sandbox popover item
    createSandboxPopoverItem(sandbox, index) {
        const item = document.createElement('div');
        item.className = 'sandbox-popover-item';
        item.innerHTML = `
            <div class="icon">
                ${sandbox.type === 'organization' ? 
                    '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 0L10.5 5.5H16L11.5 9L13 14.5L8 11L3 14.5L4.5 9L0 5.5H5.5L8 0Z" fill="currentColor"/></svg>' :
                    '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 0C10.21 0 12 1.79 12 4C12 6.21 10.21 8 8 8C5.79 8 4 6.21 4 4C4 1.79 5.79 0 8 0ZM8 10C12.42 10 16 11.79 16 14V16H0V14C0 11.79 3.58 10 8 10Z" fill="currentColor"/></svg>'
                }
            </div>
            ${sandbox.name}
        `;
        item.addEventListener('click', () => this.enterSandboxMode(sandbox));
        return item;
    }

    // Create account popover sandbox item
    createAccountPopoverSandboxItem(sandbox, index) {
        const item = document.createElement('div');
        item.className = 'account-popover-item sandbox-item';
        item.innerHTML = `
            <div class="icon">
                ${sandbox.type === 'organization' ? 
                    '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 0L10.5 5.5H16L11.5 9L13 14.5L8 11L3 14.5L4.5 9L0 5.5H5.5L8 0Z" fill="currentColor"/></svg>' :
                    '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 0C10.21 0 12 1.79 12 4C12 6.21 10.21 8 8 8C5.79 8 4 6.21 4 4C4 1.79 5.79 0 8 0ZM8 10C12.42 10 16 11.79 16 14V16H0V14C0 11.79 3.58 10 8 10Z" fill="currentColor"/></svg>'
                }
            </div>
            ${sandbox.name}
        `;
        item.addEventListener('click', () => this.enterSandboxMode(sandbox));
        return item;
    }

    // Get account by name
    getAccountByName(accountName) {
        for (const orgAccounts of Object.values(this.organizationAccounts)) {
            const account = orgAccounts.find(acc => acc.name === accountName);
            if (account) return account;
        }
        return { name: accountName, initials: accountName.substring(0, 2).toUpperCase(), color: 'color-1' };
    }

    // Optimized animation delay updates
    updateAnimationDelays(container) {
        const items = container.querySelectorAll('.sandbox-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });
    }

    // Update popover animation delays
    updatePopoverAnimationDelays(container) {
        const items = container.querySelectorAll('.sandbox-popover-item, .account-popover-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });
    }

    // Enter sandbox mode
    enterSandboxMode(sandbox) {
        const sandboxIndicatorBar = this.domCache.sandboxIndicatorBar;
        const dashboardTitle = this.domCache.dashboardTitle;
        const dashboard = this.domCache.dashboard;
        
        if (sandboxIndicatorBar) {
            sandboxIndicatorBar.style.display = 'flex';
            sandboxIndicatorBar.querySelector('span').textContent = `Sandbox Mode: ${sandbox.name}`;
        }
        
        if (dashboard) {
            dashboard.classList.add('sandbox-mode');
        }
        
        this.updateDashboardTitle(sandbox);
        this.closeAllPopovers();
    }

    // Update dashboard title for sandbox mode
    updateDashboardTitle(sandbox) {
        const dashboardTitle = this.domCache.dashboardTitle;
        const accounts = sandbox.accounts || [];
        
        if (dashboardTitle) {
            dashboardTitle.innerHTML = `${sandbox.name}<br><span id="accountSubtitle">Sandbox mode - All accounts (${accounts.length})</span>`;
        }
    }

    // Close all popovers
    closeAllPopovers() {
        const popovers = document.querySelectorAll('.popover');
        popovers.forEach(popover => popover.classList.remove('show'));
    }

    // Create sandbox
    createSandbox(sandboxName, sandboxType = 'account') {
        if (sandboxType === 'organization') {
            this.createOrganizationSandbox(sandboxName);
        } else {
            const newSandbox = {
                name: sandboxName,
                type: 'account',
                created: new Date().toISOString(),
                accounts: [this.currentActiveAccount]
            };
            
            this.accountSandboxes[this.currentActiveAccount] = 
                this.accountSandboxes[this.currentActiveAccount] || [];
            this.accountSandboxes[this.currentActiveAccount].push(newSandbox);
            this.saveAccountSandboxes();
            this.updateSandboxesForAccount(this.currentActiveAccount);
        }
    }

    // Create organization sandbox
    createOrganizationSandbox(sandboxName) {
        const activeAccount = this.domCache.activeAccount;
        if (!activeAccount || !activeAccount.dataset.organization) return;
        
        const organizationId = activeAccount.dataset.organization;
        const orgAccounts = this.organizationAccounts[organizationId] || [];
        
        const newSandbox = {
            name: sandboxName,
            type: 'organization',
            created: new Date().toISOString(),
            accounts: orgAccounts.map(acc => acc.name),
            organizationId: organizationId
        };
        
        this.organizationSandboxes[organizationId] = 
            this.organizationSandboxes[organizationId] || [];
        this.organizationSandboxes[organizationId].push(newSandbox);
        this.saveOrganizationSandboxes();
        this.updateSandboxesForAccount(this.currentActiveAccount);
    }

    // Delete sandbox
    deleteSandbox(sandboxName) {
        if (this.accountSandboxes[this.currentActiveAccount]) {
            this.accountSandboxes[this.currentActiveAccount] = 
                this.accountSandboxes[this.currentActiveAccount].filter(s => s.name !== sandboxName);
            this.saveAccountSandboxes();
            this.updateSandboxesForAccount(this.currentActiveAccount);
        }
    }

    // Delete organization sandbox
    deleteOrganizationSandbox(sandboxName, organizationId) {
        if (this.organizationSandboxes[organizationId]) {
            this.organizationSandboxes[organizationId] = 
                this.organizationSandboxes[organizationId].filter(s => s.name !== sandboxName);
            this.saveOrganizationSandboxes();
            this.updateSandboxesForAccount(this.currentActiveAccount);
        }
    }

    // Get account stats
    getAccountStats(accountName) {
        const sandboxes = this.getSandboxesForAccount(accountName);
        return {
            totalSandboxes: sandboxes.length,
            accountSandboxes: sandboxes.filter(s => s.type === 'account').length,
            organizationSandboxes: sandboxes.filter(s => s.type === 'organization').length
        };
    }

    // Get organization stats
    getOrganizationStats(organizationId) {
        const sandboxes = this.getOrganizationSandboxesForOrganization(organizationId);
        return {
            totalSandboxes: sandboxes.length,
            totalAccounts: this.organizationAccounts[organizationId]?.length || 0
        };
    }

    // Toggle panel
    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        if (panel.classList.contains('expanded')) {
            this.closePanel(panelId);
        } else {
            this.openPanel(panelId);
        }
    }

    // Open panel
    openPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        this.closeAllPanels();
        panel.classList.add('expanded');
        this.currentOpenPanel = panelId;
        this.animatePanel(panel, true);
    }

    // Close panel
    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        panel.classList.remove('expanded');
        this.currentOpenPanel = null;
        this.animatePanel(panel, false);
    }

    // Close all panels
    closeAllPanels() {
        this.panels.forEach(panel => {
            panel.classList.remove('expanded');
        });
        this.currentOpenPanel = null;
    }

    // Animate panel
    animatePanel(panel, isExpanding) {
        const items = panel.querySelectorAll('.nav-text, .dropdown-icon');
        items.forEach((item, index) => {
            if (isExpanding) {
                item.style.transitionDelay = `${index * 0.05}s`;
            } else {
                item.style.transitionDelay = '0s';
            }
        });
    }
}

// Initialize dashboard
const dashboard = new Dashboard();

// Legacy function wrappers for backward compatibility
function togglePanel(panelId) {
    return dashboard.togglePanel(panelId);
}

function createSandbox(sandboxName, sandboxType = 'account') {
    return dashboard.createSandbox(sandboxName, sandboxType);
}

function deleteSandbox(sandboxName) {
    return dashboard.deleteSandbox(sandboxName);
}

function deleteOrganizationSandbox(sandboxName, organizationId) {
    return dashboard.deleteOrganizationSandbox(sandboxName, organizationId);
}

function getAccountStats(accountName) {
    return dashboard.getAccountStats(accountName);
}

function getOrganizationStats(organizationId) {
    return dashboard.getOrganizationStats(organizationId);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add some demo functionality for nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get the text content for demo purposes
            const text = item.querySelector('.nav-text')?.textContent || 'Unknown';
            console.log(`Clicked on: ${text}`);
            
            // Update main content
            updateMainContent(text);
        });
    });

    // Add sandbox creation demo functionality
    const createSandboxButton = document.getElementById('create-sandbox-btn');
    if (createSandboxButton) {
        createSandboxButton.addEventListener('click', () => {
            const sandboxName = prompt('Enter sandbox name:');
            if (sandboxName) {
                window.dashboard.createSandbox(sandboxName);
            }
        });
    }

    // Log current account on page load
    const activeAccount = document.getElementById('active-account');
    if (activeAccount) {
        const accountName = activeAccount.dataset.accountName;
        const stats = window.dashboard.getAccountStats(accountName);
        console.log(`Active account: ${accountName}`, stats);
    }
});

// Demo function to update main content
function updateMainContent(selectedItem) {
    const mainContent = document.querySelector('.content-wrapper');
    if (mainContent) {
        const timestamp = new Date().toLocaleTimeString();
        const currentAccount = window.dashboard?.currentActiveAccount || 'Unknown';
        const accountStats = window.dashboard?.getAccountStats(currentAccount) || {};
        
        const statusMessage = document.createElement('div');
        statusMessage.className = 'status-message';
        statusMessage.innerHTML = `
            <div style="
                background: #f0f8ff;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #007AFF;
                margin: 16px 0;
                font-size: 14px;
            ">
                <p><strong>Selected:</strong> ${selectedItem} at ${timestamp}</p>
                <p><strong>Active Account:</strong> ${currentAccount}</p>
                <p><strong>Account Sandboxes:</strong> ${accountStats.totalSandboxes || 0} total, ${accountStats.recentlyUsed || 0} recently used</p>
            </div>
        `;
        
        // Remove existing status message
        const existingStatus = mainContent.querySelector('.status-message');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Add new status message
        mainContent.appendChild(statusMessage);
    }
}

// Add CSS for active nav items and sandbox management
const style = document.createElement('style');
style.textContent = `
    .nav-item.active {
        background-color: #e3f2fd !important;
        color: #1976d2;
    }
    
    .nav-item.active .icon {
        color: #1976d2 !important;
    }
    
    .nav-item.active .nav-text {
        color: #1976d2 !important;
        font-weight: 500;
    }
    
    .sandbox-popover-item.account-specific {
        border-left: 3px solid #533AFD;
    }
    
    .sandbox-stats {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
    }
`;
document.head.appendChild(style); 