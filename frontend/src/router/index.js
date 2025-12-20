import VueRouter from 'vue-router'
import Dashboard from '@/components/Dashboard.vue'
import AddPatient from '@/components/AddPatient.vue'
import ViewPatients from '@/components/ViewPatients.vue'
import Appointments from '@/components/Appointments.vue'
import Prescriptions from '@/components/Prescriptions.vue'
import AddPrescription from '@/components/AddPrescription.vue'
import AddAppointment from '@/components/AddAppointment.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard',
      breadcrumb: 'Dashboard'
    }
  },
  {
    path: '/add',
    name: 'AddPatient',
    component: AddPatient,
    meta: {
      title: 'Add Patient',
      breadcrumb: 'Add Patient'
    }
  },
  {
    path: '/view',
    name: 'ViewPatients',
    component: ViewPatients,
    meta: {
      title: 'Patient Records',
      breadcrumb: 'Patient Records'
    }
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: Appointments,
    meta: {
      title: 'Appointments',
      breadcrumb: 'Appointments'
    }
  },
  {
    path: '/prescriptions',
    name: 'Prescriptions',
    component: Prescriptions,
    meta: {
      title: 'Prescriptions',
      breadcrumb: 'Prescriptions'
    }
  },
  {
    path: '/add-prescription',
    name: 'AddPrescription',
    component: AddPrescription,
    meta: {
      title: 'Add Prescription',
      breadcrumb: 'Add Prescription'
    }
  },
  {
    path: '/add-appointment',
    name: 'AddAppointment',
    component: AddAppointment,
    meta: {
      title: 'Add Appointment',
      breadcrumb: 'Add Appointment'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 }
  }
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | Healthcare Clinic` : 'Healthcare Clinic'
  next()
})

export default router