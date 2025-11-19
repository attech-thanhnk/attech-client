import RequireAdminAuth from './components/RequireAdminAuth';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './pages/Dashboard.jsx';
import ProductsList from './pages/ProductsList.jsx';
import ServicesList from './pages/ServicesList.jsx';
import NewsList from './pages/NewsList.jsx';
import NotificationsList from './pages/NotificationsList.jsx';
import AlbumList from './pages/AlbumList.jsx';
import DocumentsList from './pages/DocumentsList.jsx';
import InternalDocumentsList from './pages/InternalDocumentsList.jsx';
import ContactList from './pages/ContactList.jsx';
import PhoneBookList from './pages/PhoneBookList.jsx';
import LanguageContentManager from './pages/LanguageContentManager.jsx';

import NotFound from './pages/NotFound/NotFound';
import ProductCategory from './menu/ProductCategory/ProductCategory.js';
import NewsCategory from './menu/NewsCategory/NewsCategory.js';
import NotificationCategory from './menu/NotificationCategory/NotificationCategory.js';
import ConfigBanner from './pages/ConfigBanner.jsx';
import UserManagement from './pages/UserManagement.jsx';
// PermissionManagement removed - using UserLevel system only
import RoleManagement from './pages/RoleManagement.jsx';
import AccountManagement from './pages/AccountManagement.jsx';
import MenuManagement from './pages/MenuManagement.jsx';

const adminRoutesConfig = [
  {
    path: '',
    layout: AdminLayout,
    guard: RequireAdminAuth,
    protected: true,
    children: [
      { index: true, element: Dashboard },
      { path: 'dashboard', element: Dashboard },
      { path: 'products', element: ProductsList },
      { path: 'services', element: ServicesList },
      { path: 'news', element: NewsList },
      { path: 'notifications', element: NotificationsList },
      { path: 'albums', element: AlbumList },
      { path: 'documents', element: DocumentsList },
      { path: 'internal-documents', element: InternalDocumentsList },
      { path: 'contacts', element: ContactList },
      { path: 'phonebook', element: PhoneBookList },
      { path: 'language-content', element: LanguageContentManager },
      { path: 'users', element: UserManagement },
      { path: 'roles', element: RoleManagement },
      // { path: 'permissions', element: PermissionManagement }, // Removed - UserLevel system only
      { path: 'product-category', element: ProductCategory },
      { path: 'news-category', element: NewsCategory },
      { path: 'notification-category', element: NotificationCategory },
      { path: 'config', element: ConfigBanner },
      { path: 'menu', element: MenuManagement },
      { path: 'account', element: AccountManagement },
      { path: '*', element: NotFound },
    ],
  },
];

export default adminRoutesConfig; 