export type MyanmarCityOption = {
  name: string;
  townships: string[];
};

export type MyanmarLocationOption = {
  cities: MyanmarCityOption[];
  region: string;
  townships: string[];
};
