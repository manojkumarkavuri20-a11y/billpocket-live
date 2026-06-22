// BillPocket — constants & static rule tables
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

const STORAGE_KEY = "billpocket.bills.v1";
const CATEGORY_KEY = "billpocket.categories.v1";
const REMINDER_KEY = "billpocket.reminders.v1";
const THEME_KEY = "billpocket.theme.v1";
const STATEMENT_KEY = "billpocket.statementTransactions.v1";
const BUDGET_KEY = "billpocket.budgets.v1";
const GOAL_KEY = "billpocket.goals.v1";
const CANCEL_KEY = "billpocket.cancelPlanner.v1";
const ACCOUNT_KEY = "billpocket.accountSettings.v1";
const SIMULATOR_KEY = "billpocket.simulatorScenarios.v1";
const CATEGORY_RULES_KEY = "billpocket.categoryRules.v1";
const ACCENT_KEY = "billpocket.accent.v1";
const ONBOARDING_KEY = "billpocket.onboarded.v1";
const FX_KEY = "billpocket.fxRates.v1";
const TAGS_KEY = "billpocket.tags.v1";
const SAVED_FILTERS_KEY = "billpocket.savedFilters.v1";
const PAYMENT_HISTORY_KEY = "billpocket.paymentHistory.v1";
const LOCK_KEY = "billpocket.lock.v1";
const LOCKED_BLOB_KEY = "billpocket.locked.v1";
const defaultCategories = ["Housing", "Utilities", "Entertainment", "Health", "Transport", "Learning", "Other"];
const defaultOwnAccounts = ["HSBC", "Lloyds", "Revolut", "Monzo"];
const defaultAccountSettings = {
  accounts: defaultOwnAccounts,
  transferWindowDays: 2,
  amountTolerancePercent: 1.5,
};
const statementCategoryRules = [
  { category: "Groceries", words: ["tesco", "sainsbury", "asda", "aldi", "lidl", "morrisons", "waitrose", "grocery", "supermarket"] },
  { category: "Dining", words: ["restaurant", "cafe", "coffee", "starbucks", "costa", "mcdonald", "kfc", "deliveroo", "ubereats", "just eat", "takeaway"] },
  { category: "Transport", words: ["uber", "bolt", "train", "rail", "bus", "tfl", "petrol", "fuel", "shell", "bp ", "parking"] },
  { category: "Housing", words: ["rent", "mortgage", "letting", "landlord"] },
  { category: "Utilities", words: ["energy", "electric", "gas", "water", "broadband", "internet", "mobile", "phone", "vodafone", "o2", "ee ", "three"] },
  { category: "Shopping", words: ["amazon", "ebay", "argos", "primark", "zara", "hm", "ikea", "paypal"] },
  { category: "Entertainment", words: ["netflix", "spotify", "disney", "youtube", "prime video", "cinema", "odeon", "steam", "xbox", "playstation"] },
  { category: "Health", words: ["pharmacy", "boots", "dentist", "doctor", "gym", "puregym", "fitness"] },
  { category: "Fees", words: ["fee", "charge", "interest", "overdraft"] },
];
const subscriptionWords = ["subscription", "membership", "netflix", "spotify", "disney", "apple", "google", "microsoft", "adobe", "youtube", "prime", "gym", "canva", "notion", "dropbox", "icloud"];
const salaryWords = ["salary", "wage", "payroll", "paye", "payslip", "employer"];
const nonSubscriptionWords = ["salary", "wage", "payroll", "paye", "payslip", "employer", "hmrc", "dwp", "universal credit", "student finance", "refund", "transfer", "the range"];

const frequencyLabels = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const accentOptions = [
  { id: "terracotta", label: "Terracotta", hex: "#cc785c" },
  { id: "sage",       label: "Sage",       hex: "#5a7a5e" },
  { id: "indigo",     label: "Indigo",     hex: "#4a6b8a" },
  { id: "plum",       label: "Plum",       hex: "#7d5e75" },
  { id: "ochre",      label: "Ochre",      hex: "#b5894e" },
  { id: "teal",       label: "Teal",       hex: "#4a847f" },
];
const defaultAccent = "terracotta";

const billTemplates = [
  { name: "Netflix",       amount: 9.99,  frequency: "monthly", category: "Entertainment" },
  { name: "Spotify",       amount: 10.99, frequency: "monthly", category: "Entertainment" },
  { name: "Disney+",       amount: 7.99,  frequency: "monthly", category: "Entertainment" },
  { name: "Apple Music",   amount: 10.99, frequency: "monthly", category: "Entertainment" },
  { name: "Amazon Prime",  amount: 8.99,  frequency: "monthly", category: "Entertainment" },
  { name: "Rent",          amount: 0,     frequency: "monthly", category: "Housing" },
  { name: "Gym",           amount: 30,    frequency: "monthly", category: "Health" },
  { name: "Council tax",   amount: 0,     frequency: "monthly", category: "Housing" },
];

// FX rates: 1 unit of the given currency equals N base-currency (GBP) units.
// Pre-seeded with sensible defaults; users edit them in Tools.
const defaultFxRates = {
  GBP: 1,
  USD: 0.79,
  EUR: 0.86,
  CAD: 0.58,
  AUD: 0.52,
  INR: 0.0094,
  JPY: 0.0050,
};
const fxBaseCurrency = "GBP";
const supportedCurrencies = ["GBP", "USD", "EUR", "CAD", "AUD", "INR", "JPY"];

const defaultTagPalette = [
  "#5a7a5e", "#4a6b8a", "#7d5e75", "#b5894e", "#4a847f", "#9c5e5a", "#6a7c8c",
];

const viewIds = ["home", "bills", "upload", "review", "charts", "whatif", "tools"];
const viewLabels = {
  home: "Home",
  bills: "Bills",
  upload: "Upload statement",
  review: "Review",
  charts: "Charts",
  whatif: "What if",
  tools: "Tools",
};
