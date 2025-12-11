import { configureStore, combineReducers } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import contactsReducer from './contactsSlice'
import quotesReducer from './quotesSlice'
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
import industriesReducer from './industriesSlice'
import testimonialsReducer from './testimonialsSlice'
import ticketsReducer from './ticketsSlice'
import dashboardReducer from './dashboardSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  contacts: contactsReducer,
  quotes: quotesReducer,
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
  industries: industriesReducer,
  testimonials: testimonialsReducer,
  tickets: ticketsReducer,
  dashboard: dashboardReducer,
})

export const store = configureStore({
  reducer: rootReducer,
})

