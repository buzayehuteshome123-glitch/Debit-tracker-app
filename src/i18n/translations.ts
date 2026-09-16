export const translations = {
  app_name: { en: 'Debt Tracker', am: 'የዕዳ መዝገብ' },

  // Navigation
  home: { en: 'Home', am: 'ቤት' },
  dashboard: { en: 'Dashboard', am: 'ዳሽቦርድ' },
  customers: { en: 'Customers', am: 'ደንበኞች' },
  activity: { en: 'Activity', am: 'እንቅስቃሴ' },
  settings: { en: 'Settings', am: 'ማስተካከያ' },

  // Dashboard
  total_outstanding: { en: 'Total Outstanding', am: 'ጠቅላላ ቀሪ ዕዳ' },
  total_customers: { en: 'Total Customers', am: 'ጠቅላላ ደንበኞች' },
  customers_count: { en: '{count} Customers', am: '{count} ደንበኞች' },
  total_debt_given: { en: 'Total Debt Given', am: 'የተሰጠ ጠቅላላ ዕዳ' },
  total_payments_received: { en: 'Total Payments Received', am: 'የተሰበሰበ ጠቅላላ ክፍያ' },
  recent_activity: { en: 'Recent Activity', am: 'የቅርብ ጊዜ እንቅስቃሴ' },
  view_all: { en: 'View All', am: 'ሁሉንም እይ' },

  // Customer list / search
  search_placeholder: { en: 'Search by name or phone', am: 'በስም ወይም በስልክ ቁጥር ፍለግ' },
  owed: { en: 'owed', am: 'ይገባል' },
  paid: { en: 'Paid', am: 'ተከፍሏል' },
  outstanding: { en: 'Outstanding', am: 'ቀሪ ዕዳ' },
  no_customers_title: { en: 'No customers yet', am: 'እስካሁን ደንበኛ የለም' },
  no_customers_subtitle: {
    en: 'Add your first customer to start tracking debt.',
    am: 'ዕዳ መከታተል ለመጀመር የመጀመሪያ ደንበኛዎን ይጨምሩ።',
  },
  no_search_results: { en: 'No customers found', am: 'ምንም ደንበኛ አልተገኘም' },
  archived: { en: 'Archived', am: 'የተመዘገበ ማህደር' },

  // Add/Edit customer
  add_customer: { en: 'Add Customer', am: 'ደንበኛ ጨምር' },
  edit_customer: { en: 'Edit Customer', am: 'ደንበኛ አስተካክል' },
  customer_name: { en: 'Customer Name', am: 'የደንበኛ ስም' },
  phone_number: { en: 'Phone Number', am: 'የስልክ ቁጥር' },
  address: { en: 'Address', am: 'አድራሻ' },
  notes: { en: 'Notes', am: 'ማስታወሻ' },
  save_customer: { en: 'Save Customer', am: 'ደንበኛ አስቀምጥ' },
  archive_customer: { en: 'Archive Customer', am: 'ደንበኛ ማህደር' },
  unarchive_customer: { en: 'Unarchive Customer', am: 'ከማህደር መልስ' },

  // Customer profile
  total_debt: { en: 'Total Debt', am: 'ጠቅላላ ዕዳ' },
  total_paid: { en: 'Total Paid', am: 'ጠቅላላ የተከፈለ' },
  transaction_history: { en: 'Transaction History', am: 'የግብይት ታሪክ' },

  // Debt / payment forms
  add_debt: { en: 'Add Debt', am: 'ዕዳ ጨምር' },
  record_payment: { en: 'Record Payment', am: 'ክፍያ መዝግብ' },
  amount: { en: 'Amount', am: 'መጠን' },
  description: { en: 'Description', am: 'መግለጫ' },
  date: { en: 'Date', am: 'ቀን' },
  save_debt: { en: 'Save Debt', am: 'ዕዳ አስቀምጥ' },
  save_payment: { en: 'Save Payment', am: 'ክፍያ አስቀምጥ' },
  payment_method: { en: 'Payment Method', am: 'የክፍያ አይነት' },
  cash: { en: 'Cash', am: 'ጥሬ ገንዘብ' },
  bank: { en: 'Bank', am: 'ባንክ' },
  other: { en: 'Other', am: 'ሌላ' },
  select_customer: { en: 'Select Customer', am: 'ደንበኛ ይምረጡ' },
  new_balance: { en: 'New Balance', am: 'አዲስ ቀሪ ዕዳ' },

  // Common actions
  save: { en: 'Save', am: 'አስቀምጥ' },
  cancel: { en: 'Cancel', am: 'ይቅር' },
  delete: { en: 'Delete', am: 'አጥፋ' },
  edit: { en: 'Edit', am: 'አስተካክል' },
  confirm: { en: 'Confirm', am: 'አረጋግጥ' },
  required: { en: 'Required', am: 'የግድ ነው' },
  optional: { en: 'Optional', am: 'አማራጭ' },
  today: { en: 'Today', am: 'ዛሬ' },
  all: { en: 'All', am: 'ሁሉም' },
  debt: { en: 'Debt', am: 'ዕዳ' },
  payment: { en: 'Payment', am: 'ክፍያ' },

  // Errors
  error_generic: { en: 'Something went wrong. Please try again.', am: 'የሆነ ችግር ተፈጥሯል። እንደገና ይሞክሩ።' },
  error_customer_name_required: { en: 'Customer name is required.', am: 'የደንበኛ ስም ያስፈልጋል።' },
  error_invalid_amount: { en: 'Enter a valid amount.', am: 'ትክክለኛ መጠን ያስገቡ።' },
  error_amount_must_be_positive: { en: 'Amount must be greater than 0.', am: 'መጠኑ ከ0 በላይ መሆን አለበት።' },
  error_invalid_date: { en: 'Enter a valid date (YYYY-MM-DD).', am: 'ትክክለኛ ቀን ያስገቡ (YYYY-MM-DD)።' },
  error_payment_exceeds_balance: {
    en: 'Payment cannot be greater than the outstanding balance.',
    am: 'የክፍያው መጠን ከቀሪ ዕዳው መብለጥ አይችልም።',
  },

  // Transaction history / activity
  no_transactions_title: { en: 'No transactions yet', am: 'እስካሁን ግብይት የለም' },
  delete_transaction_title: { en: 'Delete this transaction?', am: 'ይህን ግብይት ማጥፋት ይፈልጋሉ?' },
  delete_transaction_body: {
    en: "Deleting this transaction will change the customer's outstanding balance.",
    am: 'ይህን ግብይት ማጥፋት የደንበኛውን ቀሪ ዕዳ ይቀይራል።',
  },
  archive_customer_title: { en: 'Archive this customer?', am: 'ይህን ደንበኛ ማህደር ማድረግ ይፈልጋሉ?' },
  archive_customer_body: {
    en: 'The customer will be hidden from your list, but their history stays safe.',
    am: 'ደንበኛው ከዝርዝርዎ ይሰወራል፣ ታሪካቸው ግን በደህና ይቀመጣል።',
  },

  // Settings
  language: { en: 'Language', am: 'ቋንቋ' },
  english: { en: 'English', am: 'እንግሊዝኛ' },
  amharic: { en: 'Amharic', am: 'አማርኛ' },
  currency: { en: 'Currency', am: 'ገንዘብ' },
  backup: { en: 'Backup', am: 'ምትኬ' },
  export_csv: { en: 'Export CSV', am: 'CSV ላክ' },
  backup_data: { en: 'Backup Data', am: 'ውሂብ ምትኬ አድርግ' },
  restore_data: { en: 'Restore Data', am: 'ውሂብ መልስ' },
  restore_warning_title: { en: 'Replace existing data?', am: 'ያለውን ውሂብ መተካት ይፈልጋሉ?' },
  restore_warning_body: {
    en: 'Restoring a backup will replace all customers and transactions currently on this device.',
    am: 'ምትኬ መመለስ በዚህ መሣሪያ ላይ ያሉ ደንበኞችን እና ግብይቶችን ሁሉ ይተካል።',
  },
  about: { en: 'About', am: 'ስለ' },
  app_version: { en: 'Version', am: 'እትም' },

  // Onboarding
  onboarding_title_1: { en: 'Track Customer Debt Easily', am: 'የደንበኞችን ዕዳ በቀላሉ ይከታተሉ' },
  onboarding_title_2: { en: 'Record debts and payments', am: 'ዕዳና ክፍያ ይመዝግቡ' },
  onboarding_title_3: { en: 'Know exactly who owes you', am: 'ማን ምን ያህል እንደሚያወራህ በቀላሉ ይወቁ' },
  get_started: { en: 'Get Started', am: 'ይጀምሩ' },
  next: { en: 'Next', am: 'ቀጣይ' },
  skip: { en: 'Skip', am: 'ዝለል' },
} as const;

export type TranslationKey = keyof typeof translations;
