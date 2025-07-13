# Account-Specific Sandbox Management

This dashboard now supports account-specific sandbox management, where each account maintains its own separate set of sandboxes.

## Key Features

### 🏢 Account Isolation
- Each account has its own isolated set of sandboxes
- Switching accounts automatically updates the available sandboxes
- Sandboxes are stored per account in browser localStorage

### 🔄 Real-time Updates
- Sandbox lists update automatically when switching accounts
- Live statistics tracking (total sandboxes, recently used, created today)
- Persistent storage across browser sessions

### 📊 Analytics & Tracking
- Track sandbox usage per account
- Monitor recently used sandboxes
- See creation dates and usage statistics

## Files Updated

### `dashboard.js`
- **Account Tracking**: Monitors active account changes using MutationObserver
- **Sandbox Management**: CRUD operations for account-specific sandboxes
- **Data Persistence**: localStorage integration for cross-session data
- **UI Updates**: Dynamic sandbox list updates when switching accounts

### `dashboard-test.html`
- **Interactive Demo**: Test the account-specific sandbox functionality
- **Multiple Accounts**: Demo with Acme Corp, TechCorp Inc, and StartupSpark
- **Live Statistics**: Real-time sandbox statistics per account
- **Sandbox Operations**: Create, enter, and delete sandbox operations

## How It Works

### 1. Account Detection
The system automatically detects the current active account by monitoring the `data-account-name` attribute on the `#active-account` element.

```javascript
this.currentActiveAccount = activeAccount.dataset.accountName;
```

### 2. Sandbox Storage Structure
Sandboxes are stored in localStorage with the following structure:

```json
{
  "accountSandboxes": {
    "Acme Corp": [
      {
        "name": "Acme Corp Development",
        "type": "account",
        "organization": null,
        "account": "Acme Corp",
        "created": "2024-01-15T10:30:00.000Z",
        "lastUsed": "2024-01-16T14:22:00.000Z"
      }
    ],
    "TechCorp Inc": [
      {
        "name": "TechCorp Inc Testing",
        "type": "account",
        "organization": null,
        "account": "TechCorp Inc",
        "created": "2024-01-15T11:45:00.000Z",
        "lastUsed": null
      }
    ]
  }
}
```

### 3. Automatic UI Updates
When switching accounts, the system:
- Clears existing sandbox items from the UI
- Loads sandboxes for the new account
- Updates statistics and animations
- Maintains proper visual state

## API Reference

### Core Methods

#### `getSandboxesForAccount(accountName)`
Returns the list of sandboxes for a specific account.

#### `createSandbox(sandboxName, sandboxType = 'account')`
Creates a new sandbox for the current active account.

#### `deleteSandbox(sandboxName)`
Deletes a sandbox from the current active account.

#### `enterSandboxMode(sandbox)`
Enters sandbox mode and updates the last used timestamp.

#### `getAccountStats(accountName)`
Returns statistics for an account including total sandboxes, recently used count, and sandboxes created today.

### Global Functions

```javascript
// Create a sandbox for the current account
createSandbox('My New Sandbox');

// Delete a sandbox from the current account
deleteSandbox('Old Sandbox');

// Get account statistics
const stats = getAccountStats('Acme Corp');
console.log(stats.totalSandboxes, stats.recentlyUsed, stats.createdToday);
```

## Usage Example

### Testing the Functionality

1. Open `dashboard-test.html` in your browser
2. Notice each account starts with default sandboxes
3. Switch between accounts to see different sandbox lists
4. Create new sandboxes and observe they're account-specific
5. Check browser localStorage to see persistent data

### Integration with Existing Dashboard

The updated `dashboard.js` maintains backward compatibility while adding:
- Account-specific sandbox management
- Automatic UI updates on account switches
- Data persistence across sessions
- Real-time statistics tracking

## Benefits

### 🔒 Data Isolation
- Complete separation of sandbox data between accounts
- No cross-account data leakage
- Secure account-specific operations

### 🚀 Better UX
- Relevant sandboxes shown per account
- Automatic context switching
- Persistent data across sessions

### 📈 Insights
- Per-account usage statistics
- Sandbox creation and usage tracking
- Performance monitoring capabilities

## Browser Support

- Modern browsers with localStorage support
- MutationObserver API support
- ES6+ features (arrow functions, const/let)

## Future Enhancements

- Server-side sandbox synchronization
- Sandbox templates and cloning
- Advanced analytics and reporting
- Collaborative sandbox sharing
- Import/export functionality

---

The account-specific sandbox management ensures that each account maintains its own isolated set of sandboxes, providing better organization and security for multi-account environments. 