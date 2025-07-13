// Dashboard functionality with account-specific sandbox management
class Dashboard {
    constructor() {
        this.currentOpenPanel = null;
        this.panels = document.querySelectorAll('.nav-panel');
        this.currentActiveAccount = null;
        this.accountSandboxes = this.loadAccountSandboxes();
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

        // Close panels when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-panel')) {
                this.closeAllPanels();
            }
        });

        // Initialize account tracking
        this.initializeAccountTracking();
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

    // Save account sandboxes to localStorage
    saveAccountSandboxes() {
        localStorage.setItem('accountSandboxes', JSON.stringify(this.accountSandboxes));
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

    // Update sandbox UI for the current account
    updateSandboxesForAccount(accountName) {
        const sandboxPopover = document.getElementById('sandboxPopover');
        const sandboxPopoverContent = document.getElementById('sandbox-popover-content');
        
        if (!sandboxPopoverContent) return;

        const accountSandboxes = this.getSandboxesForAccount(accountName);
        
        // Clear existing sandbox items (keep create and manage items)
        const existingItems = sandboxPopoverContent.querySelectorAll('.sandbox-popover-item');
        existingItems.forEach(item => {
            if (item.querySelector('.accountAvatar')) {
                item.remove();
            }
        });

        // Add account-specific sandboxes
        accountSandboxes.forEach((sandbox, index) => {
            const sandboxItem = this.createSandboxItem(sandbox, index);
            
            // Insert before the divider (if it exists)
            const divider = sandboxPopoverContent.querySelector('.sandbox-popover-divider');
            if (divider) {
                sandboxPopoverContent.insertBefore(sandboxItem, divider);
            } else {
                sandboxPopoverContent.appendChild(sandboxItem);
            }
        });

        // Update animation delays
        this.updateAnimationDelays(sandboxPopoverContent);
        
        console.log(`Updated sandbox list for account: ${accountName}`, accountSandboxes);
    }

    // Create a sandbox item element
    createSandboxItem(sandbox, index) {
        const sandboxItem = document.createElement('div');
        sandboxItem.className = 'sandbox-popover-item';
        sandboxItem.setAttribute('data-sandbox-type', sandbox.type);
        sandboxItem.setAttribute('data-organization', sandbox.organization || '');
        sandboxItem.setAttribute('data-account', sandbox.account);
        
        // Generate initials from sandbox name
        const initials = sandbox.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        const colorClass = `color-${(index % 6) + 1}`;
        
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

    // Update animation delays for all items
    updateAnimationDelays(container) {
        const items = container.querySelectorAll('.sandbox-popover-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${(index + 1) * 0.05}s`;
        });
    }

    // Enter sandbox mode
    enterSandboxMode(sandbox) {
        // Update last used timestamp
        sandbox.lastUsed = new Date().toISOString();
        this.saveAccountSandboxes();

        // Call the global enterSandboxMode function if it exists
        if (typeof window.enterSandboxMode === 'function') {
            window.enterSandboxMode(sandbox.name, sandbox.type, sandbox.organization, sandbox.account);
        }
        
        console.log('Entered sandbox mode:', sandbox.name, 'for account:', sandbox.account);
    }

    // Create a new sandbox for the current account
    createSandbox(sandboxName, sandboxType = 'account') {
        if (!this.currentActiveAccount) {
            console.error('No active account to create sandbox for');
            return;
        }

        const newSandbox = {
            name: sandboxName,
            type: sandboxType,
            organization: sandboxType === 'organization' ? this.currentActiveAccount : null,
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
        const content = panel.querySelector('.panel-content');
        const title = panel.querySelector('.panel-title');
        const navTexts = panel.querySelectorAll('.nav-text');
        const dropdownIcon = panel.querySelector('.dropdown-icon');

        if (isExpanding) {
            // Expanding animation
            setTimeout(() => {
                if (title) title.style.opacity = '1';
                if (dropdownIcon) dropdownIcon.style.opacity = '1';
                navTexts.forEach(text => {
                    text.style.opacity = '1';
                });
            }, 100);
        } else {
            // Collapsing animation
            if (title) title.style.opacity = '0';
            if (dropdownIcon) dropdownIcon.style.opacity = '0';
            navTexts.forEach(text => {
                text.style.opacity = '0';
            });
        }
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

function getAccountStats(accountName) {
    if (window.dashboard) {
        return window.dashboard.getAccountStats(accountName);
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