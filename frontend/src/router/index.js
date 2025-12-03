import Vue from 'vue';
import VueRouter from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import AddPatient from '../views/AddPatient.vue';
import ViewPatients from '../views/ViewPatients.vue';
import Appointments from '../views/Appointments.vue';
import AddAppointment from '../views/AddAppointment.vue';
import Prescriptions from '../views/Prescriptions.vue';
import AddPrescription from '../views/AddPrescription.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Dashboard', breadcrumb: 'Home' }
  },
  {
    path: '/add',
    name: 'AddPatient',
    component: AddPatient,
    meta: { title: 'Add Patient', breadcrumb: 'Add Patient' }
  },
  {
    path: '/view',
    name: 'ViewPatients',
    component: ViewPatients,
    meta: { title: 'Patient Records', breadcrumb: 'Patients' }
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: Appointments,
    meta: { title: 'Appointments', breadcrumb: 'Appointments' }
  },
  {
    path: '/add-appointment',
    name: 'AddAppointment',
    component: AddAppointment,
    meta: { title: 'Schedule Appointment', breadcrumb: 'New Appointment' }
  },
  {
    path: '/prescriptions',
    name: 'Prescriptions',
    component: Prescriptions,
    meta: { title: 'Prescriptions', breadcrumb: 'Prescriptions' }
  },
  {
    path: '/add-prescription',
    name: 'AddPrescription',
    component: AddPrescription,
    meta: { title: 'New Prescription', breadcrumb: 'New Prescription' }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;