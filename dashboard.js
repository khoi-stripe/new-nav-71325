// Dashboard functionality with account-specific sandbox management
class Dashboard {
    constructor() {
        this.currentOpenPanel = null;
        this.previousNavPanelState = null;
        this.panels = document.querySelectorAll('.nav-panel');
        this.currentActiveAccount = null;
        this.accountSandboxes = this.loadAccountSandboxes();
        this.organizationSandboxes = this.loadOrganizationSandboxes();
        this.organizationAccounts = this.getOrganizationAccounts();
        
        // Clean up any broken organization sandboxes on startup
        this.cleanupBrokenOrganizationSandboxes();
        
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
        
        // Expose debugging functions globally
        window.debugSandboxes = () => this.debugSandboxStorage();
        window.clearSandboxes = () => this.clearAllSandboxData();
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
                        const previousAccount = this.currentActiveAccount;
                        this.currentActiveAccount = newAccount;
                        console.log('Account switched from:', previousAccount, 'to:', newAccount);
                        
                        // Validate sandbox isolation
                        this.validateSandboxIsolation(previousAccount, newAccount);
                        
                        this.updateSandboxesForAccount(newAccount);
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

    // Debug function to inspect sandbox storage
    debugSandboxStorage() {
        console.log('=== SANDBOX STORAGE DEBUG ===');
        console.log('Current Active Account:', this.currentActiveAccount);
        console.log('Account Sandboxes:', JSON.stringify(this.accountSandboxes, null, 2));
        console.log('Organization Sandboxes:', JSON.stringify(this.organizationSandboxes, null, 2));
        console.log('LocalStorage accountSandboxes:', localStorage.getItem('accountSandboxes'));
        console.log('LocalStorage organizationSandboxes:', localStorage.getItem('organizationSandboxes'));
        console.log('=== END DEBUG ===');
    }

    // Clear all sandbox data (for debugging)
    clearAllSandboxData() {
        this.accountSandboxes = {};
        this.organizationSandboxes = {};
        localStorage.removeItem('accountSandboxes');
        localStorage.removeItem('organizationSandboxes');
        console.log('All sandbox data cleared');
        this.updateSandboxesForAccount(this.currentActiveAccount);
    }

    // Clean up broken organization sandboxes with undefined organizationId
    cleanupBrokenOrganizationSandboxes() {
        console.log('🧹 Cleaning up broken organization sandboxes...');
        
        let cleanupCount = 0;
        const brokenKeys = [];
        
        // Find sandboxes with undefined or invalid organizationId
        Object.keys(this.organizationSandboxes).forEach(orgId => {
            if (!orgId || orgId === 'undefined' || orgId === 'null') {
                brokenKeys.push(orgId);
                const brokenSandboxes = this.organizationSandboxes[orgId];
                console.log(`🗑️  Found ${brokenSandboxes.length} broken sandboxes with invalid orgId: "${orgId}"`);
                cleanupCount += brokenSandboxes.length;
            }
        });
        
        // Remove broken entries
        brokenKeys.forEach(brokenKey => {
            delete this.organizationSandboxes[brokenKey];
        });
        
        if (cleanupCount > 0) {
            this.saveOrganizationSandboxes();
            console.log(`✅ Cleaned up ${cleanupCount} broken organization sandboxes`);
            this.updateSandboxesForAccount(this.currentActiveAccount);
        } else {
            console.log('✅ No broken organization sandboxes found');
        }
        
        return cleanupCount;
    }

    // Validate that sandbox isolation is working correctly
    validateSandboxIsolation(previousAccount, newAccount) {
        if (!previousAccount || !newAccount) return;
        
        const previousSandboxes = this.accountSandboxes[previousAccount] || [];
        const newSandboxes = this.accountSandboxes[newAccount] || [];
        
        console.log('=== SANDBOX ISOLATION VALIDATION ===');
        console.log('Previous business account:', previousAccount, 'has', previousSandboxes.length, 'sandboxes');
        console.log('New business account:', newAccount, 'has', newSandboxes.length, 'sandboxes');
        
        // Check if sandbox arrays are different references
        if (previousSandboxes === newSandboxes) {
            console.error('🚨 SANDBOX ISOLATION BROKEN: Same sandbox array reference!');
            console.error('Previous:', previousSandboxes);
            console.error('New:', newSandboxes);
        } else {
            console.log('✅ Sandbox isolation working - different array references');
        }
        
        // Check for business account-specific sandbox naming
        const previousAccountSpecific = previousSandboxes.filter(s => s.account === previousAccount);
        const newAccountSpecific = newSandboxes.filter(s => s.account === newAccount);
        
        console.log('Previous account-specific sandboxes:', previousAccountSpecific.length);
        console.log('New account-specific sandboxes:', newAccountSpecific.length);
        
        // Check if sandbox contents are improperly shared between business accounts
        const previousNames = previousSandboxes.map(s => s.name);
        const newNames = newSandboxes.map(s => s.name);
        const sharedNames = previousNames.filter(name => newNames.includes(name));
        
        if (sharedNames.length > 0) {
            console.warn('⚠️  Potentially shared sandbox names between business accounts:', sharedNames);
        }
        
        // Validate that each business account only sees its own sandboxes
        const invalidPreviousSandboxes = previousSandboxes.filter(s => s.account && s.account !== previousAccount);
        const invalidNewSandboxes = newSandboxes.filter(s => s.account && s.account !== newAccount);
        
        if (invalidPreviousSandboxes.length > 0) {
            console.error('🚨 BUSINESS ACCOUNT ISOLATION BROKEN: Previous account sees sandboxes from other accounts:', invalidPreviousSandboxes);
        }
        
        if (invalidNewSandboxes.length > 0) {
            console.error('🚨 BUSINESS ACCOUNT ISOLATION BROKEN: New account sees sandboxes from other accounts:', invalidNewSandboxes);
        }
        
        if (invalidPreviousSandboxes.length === 0 && invalidNewSandboxes.length === 0) {
            console.log('✅ Business account isolation working correctly');
        }
        
        console.log('=== END VALIDATION ===');
    }

    // Get sandboxes for a specific account
    getSandboxesForAccount(accountName) {
        if (!accountName) {
            console.error('🚨 getSandboxesForAccount called with empty accountName');
            return [];
        }
        
        console.log(`🔍 Getting sandboxes for account: "${accountName}"`);
        
        if (!this.accountSandboxes[accountName]) {
            console.log(`📦 No existing sandboxes found for "${accountName}", creating defaults...`);
            // Initialize with default sandboxes for new accounts
            this.accountSandboxes[accountName] = this.getDefaultSandboxes(accountName);
            this.saveAccountSandboxes();
            console.log(`✅ Created ${this.accountSandboxes[accountName].length} default sandboxes for "${accountName}"`);
        }
        
        const sandboxes = this.accountSandboxes[accountName];
        console.log(`📦 Returning ${sandboxes.length} sandboxes for "${accountName}":`, sandboxes.map(s => s.name));
        return sandboxes;
    }

    // Get organization sandboxes for a specific organization
    getOrganizationSandboxesForOrganization(organizationId) {
        if (!organizationId || organizationId === 'undefined' || organizationId === 'null') {
            console.error('🚨 getOrganizationSandboxesForOrganization called with invalid organizationId:', organizationId);
            return []; // Return empty array for invalid org IDs
        }
        
        console.log(`🔍 Getting organization sandboxes for organization: "${organizationId}"`);
        
        if (!this.organizationSandboxes[organizationId]) {
            console.log(`📦 No existing organization sandboxes found for "${organizationId}", creating defaults...`);
            // Initialize with default organization sandboxes
            this.organizationSandboxes[organizationId] = this.getDefaultOrganizationSandboxes(organizationId);
            this.saveOrganizationSandboxes();
            console.log(`✅ Created organization sandboxes for "${organizationId}"`);
        }
        
        const sandboxes = this.organizationSandboxes[organizationId];
        console.log(`📦 Returning ${sandboxes.length} organization sandboxes for "${organizationId}"`);
        return sandboxes;
    }

    // Get default sandboxes for an account
    getDefaultSandboxes(accountName) {
        // Create unique sandbox names with timestamp to ensure distinctness
        const timestamp = new Date().getTime();
        const accountSlug = this.createAccountSlug(accountName);
        
        return [
            {
                name: `${accountName} Development Environment`,
                type: 'account',
                organization: null,
                account: accountName,
                created: new Date().toISOString(),
                lastUsed: null,
                id: `${accountSlug}-dev-${timestamp}`, // Unique identifier with clean slug
                description: `Development sandbox for ${accountName} - safe testing environment`
            },
            {
                name: `${accountName} Staging Environment`,
                type: 'account',
                organization: null,
                account: accountName,
                created: new Date().toISOString(),
                lastUsed: null,
                id: `${accountSlug}-staging-${timestamp}`, // Unique identifier with clean slug
                description: `Staging sandbox for ${accountName} - pre-production testing`
            },
            {
                name: `${accountName} QA Testing`,
                type: 'account',
                organization: null,
                account: accountName,
                created: new Date().toISOString(),
                lastUsed: null,
                id: `${accountSlug}-qa-${timestamp}`, // Unique identifier with clean slug
                description: `Quality assurance sandbox for ${accountName} - comprehensive testing`
            }
        ];
    }

    // Helper method to create clean account slug for IDs
    createAccountSlug(accountName) {
        if (!accountName) {
            console.error('🚨 Cannot create slug from empty account name');
            return 'unknown-account';
        }
        
        const slug = accountName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
            .substring(0, 20); // Limit length
            
        console.log(`🔧 Created slug for "${accountName}": "${slug}"`);
        return slug || 'account'; // Fallback if slug becomes empty
    }

    // Get default organization sandboxes for an organization
    getDefaultOrganizationSandboxes(organizationId) {
        if (!organizationId || organizationId === 'undefined') {
            console.error('🚨 Cannot create organization sandboxes without valid organizationId:', organizationId);
            return [];
        }
        
        const orgAccounts = this.organizationAccounts[organizationId] || [];
        const timestamp = new Date().getTime();
        
        // Get organization name for unique sandbox names
        const orgName = this.getOrganizationDisplayName(organizationId);
        const orgSlug = this.createOrganizationSlug(organizationId, orgName);
        const accountCount = orgAccounts.length;
        
        return [
            {
                name: `${orgName} Multi-Account Development`,
                type: 'organization',
                organizationId: organizationId,
                accounts: orgAccounts.map(acc => ({ ...acc })), // Clone accounts
                created: new Date().toISOString(),
                lastUsed: null,
                id: `${orgSlug}-dev-${timestamp}`, // Unique identifier
                description: `Development environment for ${orgName} organization (${accountCount} accounts)`
            },
            {
                name: `${orgName} Cross-Account Integration`,
                type: 'organization',
                organizationId: organizationId,
                accounts: orgAccounts.map(acc => ({ ...acc })), // Clone accounts
                created: new Date().toISOString(),
                lastUsed: null,
                id: `${orgSlug}-integration-${timestamp}`, // Unique identifier
                description: `Integration testing across all ${orgName} accounts`
            },
            {
                name: `${orgName} Production Rollout`,
                type: 'organization',
                organizationId: organizationId,
                accounts: orgAccounts.map(acc => ({ ...acc })), // Clone accounts
                created: new Date().toISOString(),
                lastUsed: null,
                id: `${orgSlug}-production-${timestamp}`, // Unique identifier
                description: `Production deployment sandbox for ${orgName} (${accountCount} accounts)`
            },
            {
                name: `${orgName} Security & Compliance`,
                type: 'organization',
                organizationId: organizationId,
                accounts: orgAccounts.map(acc => ({ ...acc })), // Clone accounts
                created: new Date().toISOString(),
                lastUsed: null,
                id: `${orgSlug}-security-${timestamp}`, // Unique identifier
                description: `Security and compliance testing for ${orgName} organization`
            }
        ];
    }

    // Helper method to create clean organization slug for IDs
    createOrganizationSlug(organizationId, orgName) {
        // Prefer organization ID if it's clean, otherwise use name
        if (organizationId && organizationId.match(/^[a-z0-9-]+$/)) {
            return organizationId.substring(0, 15);
        }
        
        return orgName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
            .substring(0, 15); // Shorter limit for org slugs
    }

    // Helper method to get display name for organization
    getOrganizationDisplayName(organizationId) {
        // Try to find the organization name from current accounts
        const activeAccountElement = document.getElementById('active-account');
        if (activeAccountElement && activeAccountElement.dataset.organization === organizationId) {
            return activeAccountElement.dataset.accountName;
        }
        
        // Fallback to organization ID with formatting
        return organizationId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
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
        console.log('🔄 updateSandboxesForAccount called with accountName:', accountName);
        console.log('🔄 Current this.currentActiveAccount:', this.currentActiveAccount);
        
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
        const actualActiveAccountName = activeAccountElement ? activeAccountElement.dataset.accountName : null;
        
        console.log('🔄 Active account element data:', {
            accountName: actualActiveAccountName,
            organizationId: organizationId
        });
        
        // Validate account name consistency
        if (accountName !== actualActiveAccountName) {
            console.warn('⚠️  Account name mismatch! Parameter:', accountName, 'vs DOM:', actualActiveAccountName);
        }
        
        // Check if we're in sandbox mode
        const isInSandboxMode = typeof window !== 'undefined' && window.isInSandboxMode;
        const originalBusinessAccountName = typeof window !== 'undefined' ? window.originalBusinessAccountName : null;
        const originalBusinessAccountOrganization = typeof window !== 'undefined' ? window.originalBusinessAccountOrganization : null;
        
        console.log('🔄 Sandbox mode status:', {
            isInSandboxMode,
            originalBusinessAccountName,
            originalBusinessAccountOrganization
        });
        
        let sandboxesToShow = [];
        
        if (isInSandboxMode && originalBusinessAccountName) {
            // In sandbox mode - always use the original business account to determine available sandboxes
            // Don't let account switcher changes affect which sandboxes are available
            if (originalBusinessAccountOrganization) {
                // Original business account was part of an organization - show organization sandboxes
                sandboxesToShow = this.getOrganizationSandboxesForOrganization(originalBusinessAccountOrganization);
                console.log('📦 SANDBOX MODE: Showing organization sandboxes for original business account organization:', originalBusinessAccountOrganization);
            } else {
                // Original business account was standalone - show account sandboxes
                sandboxesToShow = this.getSandboxesForAccount(originalBusinessAccountName);
                console.log('📦 SANDBOX MODE: Showing account sandboxes for original business account:', originalBusinessAccountName);
            }
        } else {
            // Not in sandbox mode - use CURRENT business account to determine sandboxes
            // This is the critical path for business account isolation
            console.log('📦 NORMAL MODE: Using current business account for sandbox isolation');
            console.log('📦 Organization ID check:', organizationId, 'Type:', typeof organizationId);
            
            if (organizationId && organizationId !== 'undefined' && organizationId !== 'null') {
                // Business account is part of a VALID organization
                const accountSwitcherText = document.getElementById('accountSwitcherText');
                const isViewingAllAccounts = accountSwitcherText && accountSwitcherText.textContent === 'All accounts';
                
                console.log('📦 Valid organization detected:', organizationId);
                console.log('📦 Account switcher text:', accountSwitcherText?.textContent);
                console.log('📦 Is viewing all accounts:', isViewingAllAccounts);
                
                if (isViewingAllAccounts) {
                    // Show organization sandboxes when viewing "All accounts"
                    sandboxesToShow = this.getOrganizationSandboxesForOrganization(organizationId);
                    console.log('📦 Showing organization sandboxes for business account organization:', organizationId);
                } else if (accountSwitcherText) {
                    // Show account sandboxes for the specific selected sub-account
                    const specificAccountName = accountSwitcherText.textContent.replace(' (sandbox)', '');
                    sandboxesToShow = this.getSandboxesForAccount(specificAccountName);
                    console.log('📦 Showing account sandboxes for selected sub-account:', specificAccountName);
                } else {
                    // Fallback: show account sandboxes for the business account
                    sandboxesToShow = this.getSandboxesForAccount(accountName);
                    console.log('📦 Showing account sandboxes for business account (fallback):', accountName);
                }
            } else {
                // Business account is standalone - always show its account sandboxes
                // This is the most important case for business account isolation
                console.log('📦 STANDALONE ACCOUNT: No valid organization ID, treating as standalone');
                sandboxesToShow = this.getSandboxesForAccount(accountName);
                console.log('📦 CRITICAL: Showing account sandboxes for standalone business account:', accountName);
            }
        }
        
        // Log the final sandboxes being shown for debugging
        console.log('📦 Final sandboxesToShow:', sandboxesToShow.length, 'sandboxes');
        console.log('📦 Sandbox details:', sandboxesToShow.map(s => ({ 
            name: s.name, 
            account: s.account, 
            type: s.type,
            organizationId: s.organizationId,
            id: s.id,
            description: s.description
        })));
        
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
                
                // Insert before the divider container (if it exists)
                const dividerContainer = popoverContent.querySelector('.sandbox-popover-divider-container');
                if (dividerContainer) {
                    popoverContent.insertBefore(sandboxPopoverItem, dividerContainer);
                } else {
                    popoverContent.appendChild(sandboxPopoverItem);
                }
            });
            
            // Update animation delays for popover
            this.updatePopoverAnimationDelays(popoverContent);
        }
        
        // Determine context for logging
        const logContext = isInSandboxMode ? 'Sandbox Mode' : 
                          (organizationId ? 'Organization' : 'Account');
        console.log(`Updated sandbox list - Context: ${logContext}, Sandboxes:`, sandboxesToShow);
    }

    // Create a sandbox item element for the main list
    createSandboxItem(sandbox, index) {
        const item = document.createElement('div');
        item.className = `sandbox-item ${sandbox.type}`;
        item.style.animationDelay = `${index * 0.1}s`;

        // Get the parent business account color for this sandbox
        const businessAccountColor = this.getSandboxColor(sandbox);
        const colorHexMap = {
            'color-1': '#8B5CF6', // purple
            'color-2': '#EF4444', // red
            'color-3': '#10B981', // green
            'color-4': '#F59E0B', // amber
            'color-5': '#3B82F6', // blue
            'color-6': '#EC4899'  // pink
        };
        const hexColor = colorHexMap[businessAccountColor] || '#8B5CF6';

        // Different display for organization vs account sandboxes
        if (sandbox.type === 'organization') {
            const accountCount = sandbox.accounts ? sandbox.accounts.length : 0;
            item.innerHTML = `
                <div class="sandbox-header">
                    <div class="sandbox-icon organization-icon" style="background-color: ${hexColor}20; border: 1px solid ${hexColor}40;">
                        <svg viewBox="0 0 16 16" width="16" height="16">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.75C0 1.23122 1.23122 0 2.75 0H8C9.51878 0 10.75 1.23122 10.75 2.75V3C10.75 3.41421 10.4142 3.75 10 3.75C9.58579 3.75 9.25 3.41421 9.25 3V2.75C9.25 2.05964 8.69036 1.5 8 1.5H2.75C2.05964 1.5 1.5 2.05964 1.5 2.75V14.25C1.5 14.3881 1.61193 14.5 1.75 14.5H4.25C4.66421 14.5 5 14.8358 5 15.25C5 15.6642 4.66421 16 4.25 16H1.75C0.783502 16 0 15.2165 0 14.25V2.75ZM10.8525 5.864C11.0957 5.712 11.4043 5.712 11.6475 5.864L15.6475 8.364C15.8668 8.50105 16 8.74141 16 9V14.25C16 15.2165 15.2165 16 14.25 16H8.25C7.2835 16 6.5 15.2165 6.5 14.25V9C6.5 8.74141 6.63321 8.50105 6.8525 8.364L10.8525 5.864ZM8 9.41569V14.25C8 14.3881 8.11193 14.5 8.25 14.5H10.5V13C10.5 12.5858 10.8358 12.25 11.25 12.25C11.6642 12.25 12 12.5858 12 13V14.5H14.25C14.3881 14.5 14.5 14.3881 14.5 14.25V9.41569L11.25 7.38444L8 9.41569Z" fill="${hexColor}"/>
                            <path d="M3 4.5C3 3.94772 3.44772 3.5 4 3.5C4.55228 3.5 5 3.94772 5 4.5C5 5.05228 4.55228 5.5 4 5.5C3.44772 5.5 3 5.05228 3 4.5Z" fill="${hexColor}"/>
                            <path d="M3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8Z" fill="${hexColor}"/>
                            <path d="M6 4.5C6 3.94772 6.44772 3.5 7 3.5C7.55228 3.5 8 3.94772 8 4.5C8 5.05228 7.55228 5.5 7 5.5C6.44772 5.5 6 5.05228 6 4.5Z" fill="${hexColor}"/>
                            <path d="M3 11.5C3 10.9477 3.44772 10.5 4 10.5C4.55228 10.5 5 10.9477 5 11.5C5 12.0523 4.55228 12.5 4 12.5C3.44772 12.5 3 12.0523 3 11.5Z" fill="${hexColor}"/>
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
                    <div class="sandbox-icon account-icon" style="background-color: ${hexColor}20; border: 1px solid ${hexColor}40;">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="${hexColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="7" r="4" fill="none" stroke="${hexColor}" stroke-width="2"/>
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

    // Get the color of a business account by name
    getBusinessAccountColor(accountName) {
        // Check if this is the current active account
        const activeAccountElement = document.getElementById('active-account');
        if (activeAccountElement && activeAccountElement.dataset.accountName === accountName) {
            return activeAccountElement.dataset.accountColor;
        }
        
        // Check other business accounts in the nav panel
        const businessAccounts = document.querySelectorAll('.nav-component.business-account');
        for (const account of businessAccounts) {
            if (account.dataset.accountName === accountName) {
                return account.dataset.accountColor;
            }
        }
        
        // Fallback to a default color
        return 'color-1';
    }
    
    // Get the main business account color for an organization
    getOrganizationBusinessAccountColor(organizationId) {
        // Find the business account that belongs to this organization
        const businessAccounts = document.querySelectorAll('.nav-component.business-account.organization');
        for (const account of businessAccounts) {
            if (account.dataset.organization === organizationId) {
                return account.dataset.accountColor;
            }
        }
        
        // Also check if the active account belongs to this organization
        const activeAccountElement = document.getElementById('active-account');
        if (activeAccountElement && activeAccountElement.dataset.organization === organizationId) {
            return activeAccountElement.dataset.accountColor;
        }
        
        // Fallback to a default color
        return 'color-1';
    }
    
    // Get the appropriate color for a sandbox based on its parent business account
    getSandboxColor(sandbox) {
        if (sandbox.type === 'organization') {
            // For organization sandboxes, use the main business account color for that organization
            return this.getOrganizationBusinessAccountColor(sandbox.organizationId);
        } else {
            // For account sandboxes, use the color of the account they belong to
            return this.getBusinessAccountColor(sandbox.account);
        }
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
        
        // Use parent business account color instead of generic colors
        const colorClass = this.getSandboxColor(sandbox);
        
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

        const timestamp = new Date().getTime();
        const accountSlug = this.createAccountSlug(this.currentActiveAccount);
        
        const newSandbox = {
            name: `${this.currentActiveAccount} - ${sandboxName}`,
            type: sandboxType,
            organization: null,
            account: this.currentActiveAccount,
            created: new Date().toISOString(),
            lastUsed: null,
            id: `${accountSlug}-custom-${timestamp}`,
            description: `Custom sandbox for ${this.currentActiveAccount}: ${sandboxName}`
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
        
        if (!organizationId || organizationId === 'undefined') {
            console.error('🚨 Cannot create organization sandbox: Current account is not part of a valid organization. OrganizationId:', organizationId);
            return;
        }

        const orgAccounts = this.organizationAccounts[organizationId] || [];
        const timestamp = new Date().getTime();
        
        // Get organization name for unique sandbox names
        const orgName = this.getOrganizationDisplayName(organizationId);
        const orgSlug = this.createOrganizationSlug(organizationId, orgName);
        
        const newOrganizationSandbox = {
            name: `${orgName} - ${sandboxName}`,
            type: 'organization',
            organizationId: organizationId,
            accounts: orgAccounts.map(acc => ({ ...acc })), // Clone accounts
            created: new Date().toISOString(),
            lastUsed: null,
            id: `${orgSlug}-custom-${timestamp}`, // Unique identifier for custom sandboxes
            description: `Custom organization sandbox for ${orgName} (${orgAccounts.length} accounts): ${sandboxName}`
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
            
            // If closing account panel and nav panel was previously expanded, restore it
            if (panelId === 'accountPanel' && this.previousNavPanelState) {
                this.openPanel(this.previousNavPanelState);
                this.currentOpenPanel = this.previousNavPanelState;
                this.previousNavPanelState = null;
            } else {
                this.currentOpenPanel = null;
            }
            return;
        }

        // If opening account panel, save current nav panel state
        if (panelId === 'accountPanel' && this.currentOpenPanel === 'navPanel') {
            this.previousNavPanelState = this.currentOpenPanel;
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
        this.previousNavPanelState = null;
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

// Global debugging function for testing sandbox isolation
function debugSandboxIsolation() {
    if (!window.dashboard) {
        console.error('Dashboard not available');
        return;
    }
    
    console.log('🔍 === SANDBOX ISOLATION DEBUG ===');
    
    const activeAccount = document.getElementById('active-account');
    const currentAccount = activeAccount ? activeAccount.dataset.accountName : 'Unknown';
    const currentOrgId = activeAccount ? activeAccount.dataset.organization : 'Unknown';
    
    console.log('🔍 Current business account:', currentAccount);
    console.log('🔍 Current organization ID:', currentOrgId);
    console.log('🔍 Dashboard.currentActiveAccount:', window.dashboard.currentActiveAccount);
    
    // Show all account sandboxes
    console.log('🔍 All account sandboxes in storage:');
    Object.keys(window.dashboard.accountSandboxes).forEach(accountName => {
        const sandboxes = window.dashboard.accountSandboxes[accountName];
        console.log(`  ${accountName}: ${sandboxes.length} sandboxes`, sandboxes.map(s => ({
            name: s.name,
            account: s.account,
            id: s.id,
            description: s.description
        })));
    });
    
    // Show organization sandboxes with issue detection
    console.log('🔍 All organization sandboxes in storage:');
    let brokenOrgSandboxes = 0;
    Object.keys(window.dashboard.organizationSandboxes).forEach(orgId => {
        const sandboxes = window.dashboard.organizationSandboxes[orgId];
        const isBroken = !orgId || orgId === 'undefined' || orgId === 'null';
        const status = isBroken ? '🚨 BROKEN' : '✅ OK';
        
        console.log(`  ${orgId} (${status}): ${sandboxes.length} sandboxes`, sandboxes.map(s => ({
            name: s.name,
            organizationId: s.organizationId,
            id: s.id,
            description: s.description
        })));
        
        if (isBroken) {
            brokenOrgSandboxes += sandboxes.length;
        }
    });
    
    if (brokenOrgSandboxes > 0) {
        console.log(`🚨 Found ${brokenOrgSandboxes} broken organization sandboxes! Run cleanupBrokenOrganizationSandboxes() to fix.`);
    }
    
    // Show what sandboxes would be displayed for current account
    const currentSandboxes = window.dashboard.getSandboxesForAccount(currentAccount);
    console.log('🔍 Sandboxes for current account:', currentSandboxes.length, currentSandboxes.map(s => ({
        name: s.name,
        account: s.account,
        description: s.description,
        id: s.id
    })));
    
    console.log('🔍 === END DEBUG ===');
}

// Global cleanup function for broken organization sandboxes
function cleanupBrokenOrganizationSandboxes() {
    if (!window.dashboard) {
        console.error('Dashboard not available');
        return;
    }
    return window.dashboard.cleanupBrokenOrganizationSandboxes();
}

// Global function to upgrade existing sandboxes to new naming system
function upgradeExistingSandboxes() {
    if (!window.dashboard) {
        console.error('Dashboard not available');
        return;
    }
    
    const activeAccount = document.getElementById('active-account');
    const accountName = activeAccount ? activeAccount.dataset.accountName : null;
    
    if (!accountName) {
        console.error('No active account found');
        return;
    }
    
    console.log(`🔄 Upgrading existing sandboxes for: ${accountName}`);
    
    const existingSandboxes = window.dashboard.accountSandboxes[accountName] || [];
    
    if (existingSandboxes.length === 0) {
        console.log('No existing sandboxes to upgrade, creating new defaults...');
        return recreateDefaultSandboxes();
    }
    
    console.log(`Found ${existingSandboxes.length} existing sandboxes to upgrade:`, 
                existingSandboxes.map(s => s.name));
    
    // Clear old sandboxes and create new enhanced ones
    window.dashboard.accountSandboxes[accountName] = [];
    
    // Create new enhanced default sandboxes
    const newSandboxes = window.dashboard.getDefaultSandboxes(accountName);
    window.dashboard.accountSandboxes[accountName] = newSandboxes;
    window.dashboard.saveAccountSandboxes();
    
    console.log(`✅ Upgraded to ${newSandboxes.length} enhanced sandboxes:`, 
                newSandboxes.map(s => s.name));
    
    // Refresh the UI
    window.dashboard.updateSandboxesForAccount(accountName);
    
    return newSandboxes;
}

// Global function to recreate default sandboxes for current account
function recreateDefaultSandboxes() {
    if (!window.dashboard) {
        console.error('Dashboard not available');
        return;
    }
    
    const activeAccount = document.getElementById('active-account');
    const accountName = activeAccount ? activeAccount.dataset.accountName : null;
    
    if (!accountName) {
        console.error('No active account found');
        return;
    }
    
    console.log(`🔄 Recreating default sandboxes for: ${accountName}`);
    
    // Clear existing sandboxes for this account
    window.dashboard.accountSandboxes[accountName] = [];
    
    // Force recreation of default sandboxes
    const newSandboxes = window.dashboard.getDefaultSandboxes(accountName);
    window.dashboard.accountSandboxes[accountName] = newSandboxes;
    window.dashboard.saveAccountSandboxes();
    
    console.log(`✅ Created ${newSandboxes.length} default sandboxes for ${accountName}:`, 
                newSandboxes.map(s => s.name));
    
    // Refresh the UI
    window.dashboard.updateSandboxesForAccount(accountName);
    
    return newSandboxes;
}

// Global function to show examples of the new naming system
function showSandboxNamingExamples() {
    console.log('🎯 === SANDBOX NAMING EXAMPLES ===');
    console.log('');
    console.log('📁 Account Sandbox Examples:');
    console.log('  ✅ "Acme Corp Development Environment"');
    console.log('  ✅ "Acme Corp Staging Environment"');
    console.log('  ✅ "Acme Corp QA Testing"');
    console.log('  ✅ "Acme Corp - My Custom Feature"');
    console.log('');
    console.log('🏢 Organization Sandbox Examples:');
    console.log('  ✅ "Acme Inc Multi-Account Development"');
    console.log('  ✅ "Acme Inc Cross-Account Integration"');
    console.log('  ✅ "Acme Inc Production Rollout"');
    console.log('  ✅ "Acme Inc Security & Compliance"');
    console.log('  ✅ "Acme Inc - Company-wide Testing"');
    console.log('');
    console.log('🔧 Unique ID Examples:');
    console.log('  ✅ "acme-corp-dev-1721421234567"');
    console.log('  ✅ "acme-inc-integration-1721421234567"');
    console.log('  ✅ "beta-inc-custom-1721421234567"');
    console.log('');
    console.log('❌ Old Generic Names (FIXED):');
    console.log('  ❌ "Q3 Planning" → "Acme Inc Multi-Account Development"');
    console.log('  ❌ "Development" → "Acme Corp Development Environment"');
    console.log('  ❌ "Testing" → "Acme Corp QA Testing"');
    console.log('');
    console.log('🎯 === END EXAMPLES ===');
}

// Make debugging functions globally available
window.debugSandboxIsolation = debugSandboxIsolation;
window.cleanupBrokenOrganizationSandboxes = cleanupBrokenOrganizationSandboxes;
window.showSandboxNamingExamples = showSandboxNamingExamples;
window.recreateDefaultSandboxes = recreateDefaultSandboxes;
window.upgradeExistingSandboxes = upgradeExistingSandboxes;

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
    
    /* Tooltip hover effects with 60% opacity */
    [title]:hover {
        opacity: 0.6;
        transition: opacity 0.2s ease;
    }
    
    .mini-account-avatar:hover {
        opacity: 0.6;
        transition: opacity 0.2s ease;
    }
`;
document.head.appendChild(style); 