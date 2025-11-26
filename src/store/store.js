import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import contactsReducer from './contactsSlice'
import suppliersReducer from './suppliersSlice'
import servicesReducer from './servicesSlice'
import whyTrustUsReducer from './whyTrustUsSlice'
import energyPricesReducer from './energyPricesSlice'
import themesReducer from './themesSlice'
import faqsReducer from './faqsSlice'
import howWeWorkReducer from './howWeWorkSlice'
import newsReducer from './newsSlice'
import teamMembersReducer from './teamMembersSlice'
import documentsReducer from './documentsSlice'
import heroReducer from './heroSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    suppliers: suppliersReducer,
    services: servicesReducer,
    whyTrustUs: whyTrustUsReducer,
    energyPrices: energyPricesReducer,
    themes: themesReducer,
    faqs: faqsReducer,
    howWeWork: howWeWorkReducer,
    news: newsReducer,
    teamMembers: teamMembersReducer,
    documents: documentsReducer,
    hero: heroReducer,
  },
})

