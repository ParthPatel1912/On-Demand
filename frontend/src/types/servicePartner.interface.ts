export interface IHeading {
  title: string;
  description?: string;
  onAddClick?: () => void;
}

export interface IHelperText {
  isError: boolean;
  error?: string;
}

export interface IEducationForm {
  school: string;
  year: string;
  marks: string;
}

export interface IProfessionalForm {
  company: string;
  role: string;
  from: string;
  to: string;
}

export interface ILanguageForm {
  language: string;
  proficiency: string;
}

export interface IServicePartnerForm {
  fullName: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  applyingFor: number[];
  permanentAddress: string;
  residentialAddress: string;
  education: IEducationForm[];
  professional: IProfessionalForm[];
  skills: number[];
  servicesOffered: number[];
  languages: ILanguageForm[];
  profileImage: File | null;
  attachments: File[];
}

export interface ISubCategory {
  id: number;
  name: string;
}

export interface ICategory {
  id: number;
  name: string;
  subcategories?: ISubCategory[];
}
