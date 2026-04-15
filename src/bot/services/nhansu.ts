import { supabase } from './supabase';

export interface Personnel {
  id?: number;
  full_name: string;
  date_of_birth?: string;
  department?: string;
  education_level?: string;
  specialization?: string;
  professional_title?: string;
  professional_code?: string;
  gender?: string;
  role?: string;
}

export const PersonnelService = {
  async getAll() {
    return await supabase.from('nhansu').select('*').order('full_name');
  },

  async findByName(name: string) {
    return await supabase
      .from('nhansu')
      .select('*')
      .ilike('full_name', `%${name}%`);
  },

  async create(data: Personnel) {
    return await supabase.from('nhansu').insert(data).select().single();
  },

  async delete(id: number) {
    return await supabase.from('nhansu').delete().eq('id', id);
  },

  async getStatsByGender() {
    const { data, error } = await supabase.rpc('count_personnel_by_gender'); // Alternative: query all and group
    if (error) {
      // Manual grouping if RPC not exist
      const { data: all } = await supabase.from('nhansu').select('gender');
      const stats: Record<string, number> = {};
      all?.forEach(p => {
        const g = p.gender || 'Chưa rõ';
        stats[g] = (stats[g] || 0) + 1;
      });
      return stats;
    }
    return data;
  },

  async getStatsByEducation() {
    const { data } = await supabase.from('nhansu').select('education_level');
    const stats: Record<string, number> = {};
    data?.forEach(p => {
      const e = p.education_level || 'Chưa rõ';
      stats[e] = (stats[e] || 0) + 1;
    });
    return stats;
  }
};
