export type CountryCodeOption = {
  countryName: string;
  isoCode: string;
  label: string;
  value: string;
};

type RestCountry = {
  name?: { common?: string };
  idd?: { root?: string; suffixes?: string[] };
  cca2?: string;
};

export const COUNTRY_CODE_FALLBACK_OPTIONS: CountryCodeOption[] = [
  { countryName: "Afghanistan", isoCode: "AF", label: "Afghanistan (+93)", value: "+93" },
  { countryName: "Argentina", isoCode: "AR", label: "Argentina (+54)", value: "+54" },
  {
    countryName: "Australia",
    isoCode: "AU",
    label: "Australia (+61)",
    value: "+61",
  },
  { countryName: "Bangladesh", isoCode: "BD", label: "Bangladesh (+880)", value: "+880" },
  { countryName: "Brazil", isoCode: "BR", label: "Brazil (+55)", value: "+55" },
  { countryName: "China", isoCode: "CN", label: "China (+86)", value: "+86" },
  { countryName: "France", isoCode: "FR", label: "France (+33)", value: "+33" },
  { countryName: "Germany", isoCode: "DE", label: "Germany (+49)", value: "+49" },
  { countryName: "India", isoCode: "IN", label: "India (+91)", value: "+91" },
  { countryName: "Indonesia", isoCode: "ID", label: "Indonesia (+62)", value: "+62" },
  { countryName: "Italy", isoCode: "IT", label: "Italy (+39)", value: "+39" },
  { countryName: "Japan", isoCode: "JP", label: "Japan (+81)", value: "+81" },
  { countryName: "Malaysia", isoCode: "MY", label: "Malaysia (+60)", value: "+60" },
  { countryName: "Mexico", isoCode: "MX", label: "Mexico (+52)", value: "+52" },
  { countryName: "Nepal", isoCode: "NP", label: "Nepal (+977)", value: "+977" },
  { countryName: "Netherlands", isoCode: "NL", label: "Netherlands (+31)", value: "+31" },
  { countryName: "New Zealand", isoCode: "NZ", label: "New Zealand (+64)", value: "+64" },
  { countryName: "Pakistan", isoCode: "PK", label: "Pakistan (+92)", value: "+92" },
  { countryName: "Philippines", isoCode: "PH", label: "Philippines (+63)", value: "+63" },
  { countryName: "Singapore", isoCode: "SG", label: "Singapore (+65)", value: "+65" },
  { countryName: "South Africa", isoCode: "ZA", label: "South Africa (+27)", value: "+27" },
  { countryName: "South Korea", isoCode: "KR", label: "South Korea (+82)", value: "+82" },
  { countryName: "Spain", isoCode: "ES", label: "Spain (+34)", value: "+34" },
  { countryName: "Sri Lanka", isoCode: "LK", label: "Sri Lanka (+94)", value: "+94" },
  { countryName: "Thailand", isoCode: "TH", label: "Thailand (+66)", value: "+66" },
  { countryName: "United Arab Emirates", isoCode: "AE", label: "United Arab Emirates (+971)", value: "+971" },
  {
    countryName: "United Kingdom",
    isoCode: "GB",
    label: "United Kingdom (+44)",
    value: "+44",
  },
  {
    countryName: "United States",
    isoCode: "US",
    label: "United States (+1)",
    value: "+1",
  },
  { countryName: "Vietnam", isoCode: "VN", label: "Vietnam (+84)", value: "+84" },
];

const COUNTRY_CODES_API_URL =
  "https://restcountries.com/v3.1/all?fields=name,idd,cca2";

const PREFERRED_COUNTRY_BY_CODE: Record<
  string,
  Pick<CountryCodeOption, "countryName" | "isoCode">
> = {
  "+1": { countryName: "United States", isoCode: "US" },
  "+44": { countryName: "United Kingdom", isoCode: "GB" },
  "+61": { countryName: "Australia", isoCode: "AU" },
  "+91": { countryName: "India", isoCode: "IN" },
};

const sortCountryCodeOptions = (
  options: CountryCodeOption[]
): CountryCodeOption[] =>
  [...options].sort((a, b) => {
    const countrySort = a.countryName.localeCompare(b.countryName);
    if (countrySort !== 0) {
      return countrySort;
    }
    return a.value.localeCompare(b.value);
  });

export const getNormalizedCountryCode = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
};

export const getSupportedCountryCode = (
  value: string,
  options: CountryCodeOption[],
  fallback = "+91"
) => {
  const normalizedCode = getNormalizedCountryCode(value);
  if (options.some((option) => option.value === normalizedCode)) {
    return normalizedCode;
  }

  if (options.some((option) => option.value === fallback)) {
    return fallback;
  }

  return options[0]?.value ?? fallback;
};

export const getCountryCodeOptionLabel = (
  value: string,
  options: CountryCodeOption[]
) => {
  const normalizedCode = getNormalizedCountryCode(value);
  return (
    options.find((option) => option.value === normalizedCode)?.label ??
    normalizedCode
  );
};

export const getCountryCodeFromSearchInput = (
  input: string,
  options: CountryCodeOption[],
  fallback = "+91"
) => {
  const normalizedCode = getNormalizedCountryCode(input);
  const exactCodeMatch = options.find(
    (option) => option.value === normalizedCode
  );

  if (exactCodeMatch) {
    return exactCodeMatch.value;
  }

  const query = input.trim().toLowerCase();
  if (!query) {
    return getSupportedCountryCode(fallback, options);
  }

  const countryMatch =
    options.find(
      (option) =>
        option.label.toLowerCase() === query ||
        option.countryName.toLowerCase() === query ||
        option.isoCode.toLowerCase() === query
    ) ??
    options.find(
      (option) =>
        option.countryName.toLowerCase().startsWith(query) ||
        option.label.toLowerCase().startsWith(query) ||
        option.isoCode.toLowerCase().startsWith(query)
    ) ??
    options.find(
      (option) =>
        option.countryName.toLowerCase().includes(query) ||
        option.label.toLowerCase().includes(query) ||
        option.isoCode.toLowerCase().includes(query)
    );

  return countryMatch?.value ?? getSupportedCountryCode(fallback, options);
};

export const fetchCountryCodeOptions = async (
  signal?: AbortSignal
): Promise<CountryCodeOption[]> => {
  const response = await fetch(COUNTRY_CODES_API_URL, { signal });
  if (!response.ok) {
    throw new Error("Failed to fetch country codes");
  }

  const countries = (await response.json()) as RestCountry[];
  const uniqueOptions = new Map<string, CountryCodeOption>();

  countries.forEach((country) => {
    const countryName = country.name?.common?.trim();
    const root = country.idd?.root?.trim();

    if (!countryName || !root || !root.startsWith("+")) {
      return;
    }

    const suffixes =
      root === "+1"
        ? [""]
        : country.idd?.suffixes?.length
          ? country.idd.suffixes
          : [""];

    suffixes.forEach((suffix) => {
      const dialCode = `${root}${suffix?.trim() ?? ""}`;
      const preferredCountry = PREFERRED_COUNTRY_BY_CODE[dialCode];
      const optionCountryName = preferredCountry?.countryName ?? countryName;
      const isoCode =
        preferredCountry?.isoCode ??
        country.cca2?.toUpperCase() ??
        optionCountryName.toUpperCase();

      if (!uniqueOptions.has(dialCode) || preferredCountry) {
        uniqueOptions.set(dialCode, {
          countryName: optionCountryName,
          isoCode,
          label: `${optionCountryName} (${dialCode})`,
          value: dialCode,
        });
      }
    });
  });

  const options = sortCountryCodeOptions(Array.from(uniqueOptions.values()));

  if (!options.length) {
    throw new Error("No country code options available");
  }

  return options;
};
