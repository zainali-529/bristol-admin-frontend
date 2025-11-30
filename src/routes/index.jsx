import { createBrowserRouter, Navigate } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import DashboardPage from '@/pages/dashboard/Dashboard'
import PricingPage from '@/pages/pricing/Pricing'
import EnergyPriceTrackerPage from '@/pages/pricing/EnergyPriceTracker'
import SuppliersPage from '@/pages/suppliers/Suppliers'
import ServicesPage from '@/pages/services/Services'
import FAQsPage from '@/pages/faqs/FAQs'
import NewsPage from '@/pages/news/News'
import TeamMembersPage from '@/pages/teamMembers/TeamMembers'
import DocumentsPage from '@/pages/documents/Documents'
import DocumentCreatorPage from '@/pages/documents/DocumentCreator'
import InsightsPage from '@/pages/insights/Insights'
import ThemeCustomizationPage from '@/pages/customization/ThemeCustomization'
import TrustCustomizationPage from '@/pages/customization/TrustCustomization'
import WhyTrustUsPage from '@/pages/customization/WhyTrustUs'
import HowWeWorkPage from '@/pages/customization/HowWeWork'
import HeroCustomizationPage from '@/pages/customization/HeroCustomization'
import SettingsPage from '@/pages/settings/Settings'
import LoginPage from '@/pages/auth/Login'
import ContactsPage from '@/pages/contacts/Contacts'
import QuotesPage from '@/pages/quotes/Quotes'
import IndustriesPage from '@/pages/industries/Industries'
import TestimonialsPage from '@/pages/testimonials/Testimonials'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'pricing',
        element: <EnergyPriceTrackerPage />,
      },
        {
          path: 'suppliers',
          element: <SuppliersPage />,
        },
        {
          path: 'services',
          element: <ServicesPage />,
        },
        {
          path: 'industries',
          element: <IndustriesPage />,
        },
        {
          path: 'testimonials',
          element: <TestimonialsPage />,
        },
        {
          path: 'faqs',
          element: <FAQsPage />,
        },
        {
          path: 'news',
          element: <NewsPage />,
        },
        {
          path: 'team-members',
          element: <TeamMembersPage />,
        },
        {
          path: 'documents',
          element: <DocumentsPage />,
        },
        {
          path: 'documents/create',
          element: <DocumentCreatorPage />,
        },
        {
          path: 'insights',
          element: <InsightsPage />,
        },
      {
        path: 'contacts',
        element: <ContactsPage />,
      },
      {
        path: 'quotes',
        element: <QuotesPage />,
      },
      {
        path: 'customization/theme',
        element: <ThemeCustomizationPage />,
      },
      {
        path: 'customization/trust',
        element: <TrustCustomizationPage />,
      },
      {
        path: 'customization/why-trust-us',
        element: <WhyTrustUsPage />,
      },
      {
        path: 'customization/how-we-work',
        element: <HowWeWorkPage />,
      },
      {
        path: 'customization/hero',
        element: <HeroCustomizationPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
])

export default router
