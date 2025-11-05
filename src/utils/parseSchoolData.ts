export interface SchoolData {
  nat_emis: string;
  province: string;
  institution_name: string;
  status: string;
  sector: string;
  type_doe: string;
  phase_ped: string;
  district: string;
  circuit: string;
  quintile: string;
  no_fee_school: string;
  urban_rural: string;
  longitude: number | null;
  latitude: number | null;
  town_city: string;
  suburb: string;
  township_village: string;
  street_address: string;
  postal_address: string;
  telephone: string;
  learners_2024: number;
  educators_2024: number;
}

export const parseSchoolRow = (row: any): SchoolData | null => {
  try {
    const longitude = parseFloat(row.GIS_Longitude || row.Longitude);
    const latitude = parseFloat(row.GIS_Latitude || row.Latitude);

    return {
      nat_emis: row.NatEmis || row.NATEMIS || '',
      province: row.Province || '',
      institution_name: row.Official_Institution_Name || row.Institution_Name || '',
      status: row.Status || '',
      sector: row.Sector || '',
      type_doe: row.Type_DoE || '',
      phase_ped: row.Phase_PED || '',
      district: row.EIDistrict || '',
      circuit: row.EICircuit || '',
      quintile: row.Quintile || '',
      no_fee_school: row.NoFeeSchool || '',
      urban_rural: row.Urban_Rural || '',
      longitude: !isNaN(longitude) ? longitude : null,
      latitude: !isNaN(latitude) ? latitude : null,
      town_city: row.Town_City || row.towncity || '',
      suburb: row.Suburb || '',
      township_village: row.Township_Village || '',
      street_address: row.StreetAddress || '',
      postal_address: row.PostalAddress || '',
      telephone: row.Telephone || '',
      learners_2024: parseInt(row.Learners2024) || 0,
      educators_2024: parseInt(row.Educators2024) || 0,
    };
  } catch (error) {
    console.error('Error parsing school row:', error);
    return null;
  }
};