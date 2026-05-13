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
  { countryName: "India", isoCode: "IN", label: "India (+91)", value: "+91" },
  {
    countryName: "United States",
    isoCode: "US",
    label: "United States (+1)",
    value: "+1",
  },
  {
    countryName: "United Kingdom",
    isoCode: "GB",
    label: "United Kingdom (+44)",
    value: "+44",
  },
  {
    countryName: "Australia",
    isoCode: "AU",
    label: "Australia (+61)",
    value: "+61",
  },
];

const COUNTRY_CODES_API_URL =
  "https://restcountries.com/v3.1/all?fields=name,idd,cca2";

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

    const suffixes = country.idd?.suffixes?.length ? country.idd.suffixes : [""];
    suffixes.forEach((suffix) => {
      const dialCode = `${root}${suffix?.trim() ?? ""}`;
      const isoCode = country.cca2?.toUpperCase() ?? countryName.toUpperCase();
      const key = dialCode;

      if (!uniqueOptions.has(key)) {
        uniqueOptions.set(key, {
          countryName,
          isoCode,
          label: `${countryName} (${dialCode})`,
          value: dialCode,
        });
      }
    });
  });

  const options = Array.from(uniqueOptions.values()).sort((a, b) => {
    const countrySort = a.countryName.localeCompare(b.countryName);
    if (countrySort !== 0) {
      return countrySort;
    }
    return a.value.localeCompare(b.value);
  });

  if (!options.length) {
    throw new Error("No country code options available");
  }

  return options;
};
