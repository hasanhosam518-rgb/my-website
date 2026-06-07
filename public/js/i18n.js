const translations = {
  en: {
    siteTitle: 'Red Sea Excursions Hub',
    featured: 'Featured Trips',
    contact: 'Contact',
    trips: 'Trips',
    blog: 'Blog',
    search: 'Search',
    bookNow: 'Book Now',
    viewDetails: 'View Details',
    allTrips: 'All Trips',
    contactUs: 'Contact Us',
    sendMessage: 'Send Message',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    yourMessage: 'Your Message',
    bookingConfirmed: 'Booking Confirmed!',
    noPosts: 'No posts yet. Check back soon!',
    reviewTitle: 'Reviews',
    sendReview: 'Send Review',
    shareExperience: 'Share your experience...'
  },
  ar: {
    siteTitle: 'مركز رحلات البحر الأحمر',
    featured: 'الرحلات المميزة',
    contact: 'اتصل بنا',
    trips: 'الرحلات',
    blog: 'المدونة',
    search: 'بحث',
    bookNow: 'احجز الآن',
    viewDetails: 'عرض التفاصيل',
    allTrips: 'جميع الرحلات',
    contactUs: 'تواصل معنا',
    sendMessage: 'أرسل رسالة',
    yourName: 'اسمك',
    yourEmail: 'بريدك الإلكتروني',
    yourMessage: 'رسالتك',
    bookingConfirmed: 'تم تأكيد الحجز!',
    noPosts: 'لا توجد منشورات بعد. عد لاحقاً!',
    reviewTitle: 'التقييمات',
    sendReview: 'أرسل تقييم',
    shareExperience: 'شارك تجربتك...'
  }
};

export function t(key) {
  const lang = localStorage.getItem('lang') || 'en';
  return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}

export function initI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    el.textContent = t(k);
  });
}

export function setLang(lang) {
  localStorage.setItem('lang', lang);
  initI18n();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

export default { t, initI18n, setLang };
