import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";
import en from "./en";
import es from "./es";

const i18n = new I18n({ en, es });

const locale = getLocales()[0]?.languageCode ?? "en";
i18n.locale = locale;
i18n.enableFallback = true;
i18n.defaultLocale = "en";

export default i18n;