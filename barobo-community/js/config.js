/* config.js — site settings. Edit the site name, barangays, and categories here. */
(function (B) {
  B.config = {
    siteName: 'Barobo Community',
    tagline: 'For the people of Barobo',
    storagePrefix: 'barobo:',
    supabase: {
      url: 'https://imuevjmpwiuaxbwqqjmo.supabase.co',
      anonKey: 'sb_publishable_1CQHtTzDraZOTeP0_hiLag_0nMXt6rB'
    },

    // Add all barangays to this list.
    barangays: ['Poblacion', 'Other Barangay'],

    newsCategories: ['All', 'News', 'Health', 'Education', 'Business'],
    boardCategories: ['Question', 'Help', 'For Sale', 'Barangay News', 'Other'],
    directoryCategories: ['Emergency', 'Health', 'Government', 'Tourism', 'School', 'Business', 'Transportation'],

    limits: { postMin: 5, postMax: 500, nameMin: 2, nameMax: 40 }
  };
})(window.Barobo = window.Barobo || {});
