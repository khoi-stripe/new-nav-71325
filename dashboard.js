// Dashboard functionality with account-specific sandbox management
class Dashboard {
    constructor() {
        this.currentOpenPanel = null;
        this.panels = document.querySelectorAll('.nav-panel');
        this.currentActiveAccount = null;
        this.accountSandboxes = this.loadAccountSandboxes();
        this.organizationSandboxes = this.loadOrganizationSandboxes();
        this.organizationAccounts = this.getOrganizationAccounts();
        this.init();
    }

    init() {
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

        // Close panels when clicking outside (disabled for dashboard.html compatibility)
        // document.addEventListener('click', (e) => {
        //     if (!e.target.closest('.nav-panel')) {
        //         this.closeAllPanels();
        //     }
        // });

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
        const activeAccount = document.getElementById('active-account');
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
            // Initialize with default sandboxes for new accounts
            this.accountSandboxes[accountName] = this.getDefaultSandboxes(accountName);
            this.saveAccountSandboxes();
        }
        return this.accountSandboxes[accountName];
    }

    // Get organization sandboxes for a specific organization
    getOrganizationSandboxesForOrganization(organizationId) {
        if (!this.organizationSandboxes[organizationId]) {
            // Initialize with default organization sandboxes
            this.organizationSandboxes[organizationId] = this.getDefaultOrganizationSandboxes(organizationId);
            this.saveOrganizationSandboxes();
        }
        return this.organizationSandboxes[organizationId];
    }

    // Get default sandboxes for an account
    getDefaultSandboxes(accountName) {
        return [
            {
                name: `${accountName} Development`,
                type: 'account',
                organization: null,
                account: accountName,
                created: new Date().toISOString(),
                lastUsed: null
            },
            {
                name: `${accountName} Testing`,
                type: 'account',
                organization: null,
                account: accountName,
                created: new Date().toISOString(),
                lastUsed: null
            }
        ];
    }

    // Get default organization sandboxes for an organization
    getDefaultOrganizationSandboxes(organizationId) {
        const orgAccounts = this.organizationAccounts[organizationId] || [];
        const orgName = this.getOrganizationName(organizationId);
        
        return [
            {
                name: `${orgName} Development Environment`,
                type: 'organization',
                organizationId: organizationId,
                accounts: orgAccounts.map(acc => ({ ...acc })), // Clone accounts
                created: new Date().toISOString(),
                lastUsed: null
            },
            {
                name: `${orgName} Testing Environment`,
                type: 'organization',
                organizationId: organizationId,
                accounts: orgAccounts.map(acc => ({ ...acc })), // Clone accounts
                created: new Date().toISOString(),
                lastUsed: null
            }
        ];
    }

    // Get organization name from ID
    getOrganizationName(organizationId) {
        const orgMapping = {
            'acme-inc': 'Acme Inc',
            'lil-fatsos': 'Lil\'Fatsos'
        };
        return orgMapping[organizationId] || organizationId;
    }

    // Update sandboxes display for current account
    updateSandboxesForAccount(accountName) {
        const container = document.getElementById('sandbox-list');
        const popoverContent = document.getElementById('sandbox-popover-content');
        
        if (container) {
            // Clear existing items in main container
            container.innerHTML = '';
        }
        
        if (popoverContent) {
            // Clear existing sandbox items from popover (keep create and manage items)
            const existingItems = popoverContent.querySelectorAll('.sandbox-popover-item');
            existingItems.forEach(item => {
                if (item.querySelector('.accountAvatar')) {
                    item.remove();
                }
            });
        }

        // Check if current account belongs to an organization
        const activeAccountElement = document.getElementById('active-account');
        const organizationId = activeAccountElement ? activeAccountElement.dataset.organization : null;
        
        // Determine current viewing context (organization vs specific account)
        // Use a slight delay to ensure the account switcher text is updated
        setTimeout(() => {
            const accountSwitcherText = document.getElementById('accountSwitcherText');
            const isViewingAllAccounts = accountSwitcherText && accountSwitcherText.textContent === 'All accounts';
            
            let sandboxesToShow = [];
            
            if (isViewingAllAccounts && organizationId) {
                // Show only organization sandboxes when viewing "All accounts"
                sandboxesToShow = this.getOrganizationSandboxesForOrganization(organizationId);
                console.log('Showing organization sandboxes for:', organizationId);
            } else if (!isViewingAllAccounts && accountSwitcherText) {
                // Show account sandboxes for the specific selected account
                const specificAccountName = accountSwitcherText.textContent;
                sandboxesToShow = this.getSandboxesForAccount(specificAccountName);
                console.log('Showing account sandboxes for:', specificAccountName);
            } else {
                // Fallback: show account sandboxes for the main account
                sandboxesToShow = this.getSandboxesForAccount(accountName);
                console.log('Showing fallback account sandboxes for:', accountName);
            }
            
            // Populate main container
            if (container) {
                sandboxesToShow.forEach((sandbox, index) => {
                    const sandboxItem = this.createSandboxItem(sandbox, index);
                    container.appendChild(sandboxItem);
                });
                
                // Update animation delays
                this.updateAnimationDelays(container);
            }
            
            // Populate sandbox popover
            if (popoverContent) {
                sandboxesToShow.forEach((sandbox, index) => {
                    const sandboxPopoverItem = this.createSandboxPopoverItem(sandbox, index);
                    
                    // Insert before the divider (if it exists)
                    const divider = popoverContent.querySelector('.sandbox-popover-divider');
                    if (divider) {
                        popoverContent.insertBefore(sandboxPopoverItem, divider);
                    } else {
                        popoverContent.appendChild(sandboxPopoverItem);
                    }
                });
                
                // Update animation delays for popover
                this.updatePopoverAnimationDelays(popoverContent);
            }
            
            console.log(`Updated sandbox list - Context: ${isViewingAllAccounts ? 'Organization' : 'Account'}, Sandboxes:`, sandboxesToShow);
        }, 10); // Small delay to ensure DOM updates are complete
    }

    // Create a sandbox item element for the main list
    createSandboxItem(sandbox, index) {
        const item = document.createElement('div');
        item.className = `sandbox-item ${sandbox.type}`;
        item.style.animationDelay = `${index * 0.1}s`;

        // Different display for organization vs account sandboxes
        if (sandbox.type === 'organization') {
            const accountCount = sandbox.accounts ? sandbox.accounts.length : 0;
            item.innerHTML = `
                <div class="sandbox-header">
                    <div class="sandbox-icon organization-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M3 21h18"/>
                            <path d="M5 21V7l8-4v18"/>
                            <path d="M19 21V11l-6-4"/>
                            <path d="M9 9v.01"/>
                            <path d="M9 12v.01"/>
                            <path d="M9 15v.01"/>
                            <path d="M9 18v.01"/>
                        </svg>
                    </div>
                    <div class="sandbox-info">
                        <div class="sandbox-name">${sandbox.name}</div>
                        <div class="sandbox-meta">Organization • ${accountCount} accounts</div>
                    </div>
                </div>
                <div class="sandbox-accounts">
                    ${sandbox.accounts.slice(0, 3).map(acc => `
                        <div class="mini-account-avatar ${acc.color}" title="${acc.name}">${acc.initials}</div>
                    `).join('')}
                    ${accountCount > 3 ? `<div class="account-count">+${accountCount - 3}</div>` : ''}
                </div>
                <div class="sandbox-actions">
                    <button class="enter-sandbox-btn" onclick="dashboard.enterSandboxMode(${JSON.stringify(sandbox).replace(/"/g, '&quot;')})">
                        Enter
                    </button>
                    <button class="delete-sandbox-btn" onclick="dashboard.deleteOrganizationSandbox('${sandbox.name}', '${sandbox.organizationId}')">
                        Delete
                    </button>
                </div>
            `;
        } else {
            item.innerHTML = `
                <div class="sandbox-header">
                    <div class="sandbox-icon account-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div class="sandbox-info">
                        <div class="sandbox-name">${sandbox.name}</div>
                        <div class="sandbox-meta">Account sandbox</div>
                    </div>
                </div>
                <div class="sandbox-actions">
                    <button class="enter-sandbox-btn" onclick="dashboard.enterSandboxMode(${JSON.stringify(sandbox).replace(/"/g, '&quot;')})">
                        Enter
                    </button>
                    <button class="delete-sandbox-btn" onclick="dashboard.deleteSandbox('${sandbox.name}')">
                        Delete
                    </button>
                </div>
            `;
        }

        return item;
    }

    // Create a sandbox item element for the popover
    createSandboxPopoverItem(sandbox, index) {
        const sandboxItem = document.createElement('div');
        sandboxItem.className = 'sandbox-popover-item';
        sandboxItem.setAttribute('data-sandbox-type', sandbox.type);
        sandboxItem.setAttribute('data-organization', sandbox.organizationId || '');
        sandboxItem.setAttribute('data-account', sandbox.account || '');
        
        // Generate initials from sandbox name
        const initials = sandbox.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        const colorClass = sandbox.type === 'organization' ? 'color-1' : `color-${(index % 6) + 1}`;
        
        sandboxItem.innerHTML = `
            <div class="icon">
                <div class="accountAvatar ${colorClass}">${initials}</div>
            </div>
            <span>${sandbox.name}</span>
        `;

        // Add click handler for sandbox selection
        sandboxItem.addEventListener('click', () => {
            this.enterSandboxMode(sandbox);
        });

        return sandboxItem;
    }

    // Update animation delays for items
    updateAnimationDelays(container) {
        const items = container.querySelectorAll('.sandbox-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Update animation delays for popover items
    updatePopoverAnimationDelays(container) {
        const items = container.querySelectorAll('.sandbox-popover-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${(index + 1) * 0.05}s`;
        });
    }

    // Enter sandbox mode
    enterSandboxMode(sandbox) {
        console.log('Entering sandbox mode:', sandbox.name, 'Type:', sandbox.type);
        
        // Update last used timestamp
        sandbox.lastUsed = new Date().toISOString();
        
        if (sandbox.type === 'organization') {
            // Update organization sandboxes
            const orgSandboxes = this.getOrganizationSandboxesForOrganization(sandbox.organizationId);
            const sandboxIndex = orgSandboxes.findIndex(s => s.name === sandbox.name);
            if (sandboxIndex !== -1) {
                orgSandboxes[sandboxIndex] = sandbox;
                this.organizationSandboxes[sandbox.organizationId] = orgSandboxes;
                this.saveOrganizationSandboxes();
            }
        } else {
            // Update account sandboxes
            const accountSandboxes = this.getSandboxesForAccount(sandbox.account);
            const sandboxIndex = accountSandboxes.findIndex(s => s.name === sandbox.name);
            if (sandboxIndex !== -1) {
                accountSandboxes[sandboxIndex] = sandbox;
                this.accountSandboxes[sandbox.account] = accountSandboxes;
                this.saveAccountSandboxes();
            }
        }

        // Close sandbox popover if it's open
        if (typeof window.hideSandboxPopover === 'function') {
            window.hideSandboxPopover();
        }

        // Call the global enterSandboxMode function if it exists
        if (typeof window.enterSandboxMode === 'function') {
            window.enterSandboxMode(sandbox.name, sandbox.type, sandbox.organizationId, sandbox.account);
        }

        // Update UI to show sandbox mode
        this.updateSandboxesForAccount(this.currentActiveAccount);
        
        console.log('Entered sandbox mode:', sandbox.name, 'for account:', sandbox.account || 'organization');
    }

    // Create a new sandbox for the current account
    createSandbox(sandboxName, sandboxType = 'account') {
        if (!this.currentActiveAccount) {
            console.error('No active account to create sandbox for');
            return;
        }

        if (sandboxType === 'organization') {
            return this.createOrganizationSandbox(sandboxName);
        }

        const newSandbox = {
            name: sandboxName,
            type: sandboxType,
            organization: null,
            account: this.currentActiveAccount,
            created: new Date().toISOString(),
            lastUsed: null
        };

        // Add to account sandboxes
        const accountSandboxes = this.getSandboxesForAccount(this.currentActiveAccount);
        accountSandboxes.push(newSandbox);
        this.accountSandboxes[this.currentActiveAccount] = accountSandboxes;
        this.saveAccountSandboxes();

        // Update UI
        this.updateSandboxesForAccount(this.currentActiveAccount);
        
        console.log('Created new sandbox:', sandboxName, 'for account:', this.currentActiveAccount);
        return newSandbox;
    }

    // Create a new organization sandbox
    createOrganizationSandbox(sandboxName) {
        const activeAccountElement = document.getElementById('active-account');
        const organizationId = activeAccountElement ? activeAccountElement.dataset.organization : null;
        
        if (!organizationId) {
            console.error('Current account is not part of an organization');
            return;
        }

        const orgAccounts = this.organizationAccounts[organizationId] || [];
        
        const newOrganizationSandbox = {
            name: sandboxName,
            type: 'organization',
            organizationId: organizationId,
            accounts: orgAccounts.map(acc => ({ ...acc })), // Clone accounts
            created: new Date().toISOString(),
            lastUsed: null
        };

        // Add to organization sandboxes
        const organizationSandboxes = this.getOrganizationSandboxesForOrganization(organizationId);
        organizationSandboxes.push(newOrganizationSandbox);
        this.organizationSandboxes[organizationId] = organizationSandboxes;
        this.saveOrganizationSandboxes();

        // Update UI
        this.updateSandboxesForAccount(this.currentActiveAccount);
        
        console.log('Created new organization sandbox:', sandboxName, 'for organization:', organizationId);
        return newOrganizationSandbox;
    }

    // Delete a sandbox for the current account
    deleteSandbox(sandboxName) {
        if (!this.currentActiveAccount) {
            console.error('No active account to delete sandbox from');
            return;
        }

        const accountSandboxes = this.getSandboxesForAccount(this.currentActiveAccount);
        const filteredSandboxes = accountSandboxes.filter(sandbox => sandbox.name !== sandboxName);
        
        this.accountSandboxes[this.currentActiveAccount] = filteredSandboxes;
        this.saveAccountSandboxes();

        // Update UI
        this.updateSandboxesForAccount(this.currentActiveAccount);
        
        console.log('Deleted sandbox:', sandboxName, 'from account:', this.currentActiveAccount);
    }

    // Delete an organization sandbox
    deleteOrganizationSandbox(sandboxName, organizationId) {
        const organizationSandboxes = this.getOrganizationSandboxesForOrganization(organizationId);
        const filteredSandboxes = organizationSandboxes.filter(sandbox => sandbox.name !== sandboxName);
        
        this.organizationSandboxes[organizationId] = filteredSandboxes;
        this.saveOrganizationSandboxes();

        // Update UI
        this.updateSandboxesForAccount(this.currentActiveAccount);
        
        console.log('Deleted organization sandbox:', sandboxName, 'from organization:', organizationId);
    }

    // Get account statistics
    getAccountStats(accountName) {
        const sandboxes = this.getSandboxesForAccount(accountName);
        return {
            totalSandboxes: sandboxes.length,
            recentlyUsed: sandboxes.filter(s => s.lastUsed).length,
            createdToday: sandboxes.filter(s => {
                const created = new Date(s.created);
                const today = new Date();
                return created.toDateString() === today.toDateString();
            }).length
        };
    }

    // Get organization statistics
    getOrganizationStats(organizationId) {
        const orgSandboxes = this.getOrganizationSandboxesForOrganization(organizationId);
        return {
            totalSandboxes: orgSandboxes.length,
            recentlyUsed: orgSandboxes.filter(s => s.lastUsed).length,
            createdToday: orgSandboxes.filter(s => {
                const created = new Date(s.created);
                const today = new Date();
                return created.toDateString() === today.toDateString();
            }).length
        };
    }

    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        
        if (!panel) return;

        // If this panel is already open, close it
        if (this.currentOpenPanel === panelId) {
            this.closePanel(panelId);
            this.currentOpenPanel = null;
            return;
        }

        // Close the currently open panel (if any)
        if (this.currentOpenPanel) {
            this.closePanel(this.currentOpenPanel);
        }

        // Open the new panel
        this.openPanel(panelId);
        this.currentOpenPanel = panelId;
    }

    openPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.add('expanded');
            
            // Add ARIA attributes for accessibility
            panel.setAttribute('aria-expanded', 'true');
            
            // Trigger animation
            this.animatePanel(panel, true);
        }
    }

    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.remove('expanded');
            
            // Update ARIA attributes
            panel.setAttribute('aria-expanded', 'false');
            
            // Trigger animation
            this.animatePanel(panel, false);
        }
    }

    closeAllPanels() {
        this.panels.forEach(panel => {
            panel.classList.remove('expanded');
            panel.setAttribute('aria-expanded', 'false');
            this.animatePanel(panel, false);
        });
        this.currentOpenPanel = null;
    }

    animatePanel(panel, isExpanding) {
        // Animation disabled for dashboard.html - uses CSS transitions instead
        // const content = panel.querySelector('.panel-content');
        // const title = panel.querySelector('.panel-title');
        // const navTexts = panel.querySelectorAll('.nav-text');
        // const dropdownIcon = panel.querySelector('.dropdown-icon');

        // if (isExpanding) {
        //     // Expanding animation
        //     setTimeout(() => {
        //         if (title) title.style.opacity = '1';
        //         if (dropdownIcon) dropdownIcon.style.opacity = '1';
        //         navTexts.forEach(text => {
        //             text.style.opacity = '1';
        //         });
        //     }, 100);
        // } else {
        //     // Collapsing animation
        //     if (title) title.style.opacity = '0';
        //     if (dropdownIcon) dropdownIcon.style.opacity = '0';
        //     navTexts.forEach(text => {
        //         text.style.opacity = '0';
        //     });
        // }
    }
}

// Global functions for backward compatibility
function togglePanel(panelId) {
    if (window.dashboard) {
        window.dashboard.togglePanel(panelId);
    }
}

// Global functions for sandbox management
function createSandbox(sandboxName, sandboxType = 'account') {
    if (window.dashboard) {
        return window.dashboard.createSandbox(sandboxName, sandboxType);
    }
}

function deleteSandbox(sandboxName) {
    if (window.dashboard) {
        return window.dashboard.deleteSandbox(sandboxName);
    }
}

function deleteOrganizationSandbox(sandboxName, organizationId) {
    if (window.dashboard) {
        return window.dashboard.deleteOrganizationSandbox(sandboxName, organizationId);
    }
}

function getAccountStats(accountName) {
    if (window.dashboard) {
        return window.dashboard.getAccountStats(accountName);
    }
}

function getOrganizationStats(organizationId) {
    if (window.dashboard) {
        return window.dashboard.getOrganizationStats(organizationId);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
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