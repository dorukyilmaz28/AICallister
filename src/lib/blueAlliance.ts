// Blue Alliance API utility functions
export interface BlueAllianceTeam {
  key: string;
  team_number: number;
  nickname: string;
  name: string;
  city: string;
  state_prov: string;
  country: string;
  website: string;
  rookie_year: number;
  motto: string;
}

export interface BlueAllianceError {
  Error: string;
}

export async function verifyTeamNumber(teamNumber: string): Promise<{ isValid: boolean; team?: BlueAllianceTeam; error?: string }> {
  try {
    // Blue Alliance API endpoint
    const url = `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}`;
    
    const response = await fetch(url, {
      headers: {
        'X-TBA-Auth-Key': process.env.BLUE_ALLIANCE_API_KEY || '', // API key opsiyonel
        'User-Agent': 'Callister-FRC-AI/1.0'
      }
    });

    if (response.status === 404) {
      return { isValid: false, error: 'Takım bulunamadı' };
    }

    if (response.status === 401) {
      return { isValid: false, error: 'API key gerekli' };
    }

    if (!response.ok) {
      return { isValid: false, error: 'API hatası' };
    }

    const team: BlueAllianceTeam = await response.json();
    
    return { 
      isValid: true, 
      team: {
        key: team.key,
        team_number: team.team_number,
        nickname: team.nickname,
        name: team.name,
        city: team.city,
        state_prov: team.state_prov,
        country: team.country,
        website: team.website,
        rookie_year: team.rookie_year,
        motto: team.motto
      }
    };

  } catch (error) {
    console.error('Blue Alliance API error:', error);
    return { isValid: false, error: 'Bağlantı hatası' };
  }
}

export async function getTeamInfo(teamNumber: string): Promise<BlueAllianceTeam | null> {
  const result = await verifyTeamNumber(teamNumber);
  return result.isValid ? result.team || null : null;
}

export async function searchTeamByName(teamName: string): Promise<{ teams: BlueAllianceTeam[]; error?: string }> {
  try {
    // Blue Alliance API'de takım adıyla arama için teams endpoint'ini kullanıyoruz
    // API sayfalama kullanır, ilk birkaç sayfayı kontrol ediyoruz
    const matchingTeams: BlueAllianceTeam[] = [];
    const normalizedSearchName = teamName.toLowerCase().trim();
    const maxPages = 5; // İlk 5 sayfayı kontrol et (her sayfa ~500 takım)
    
    for (let page = 0; page < maxPages; page++) {
      const url = `https://www.thebluealliance.com/api/v3/teams/${page}`;
      
      const response = await fetch(url, {
        headers: {
          'X-TBA-Auth-Key': process.env.BLUE_ALLIANCE_API_KEY || '',
          'User-Agent': 'Callister-FRC-AI/1.0'
        }
      });

      if (response.status === 401) {
        return { teams: [], error: 'API key gerekli' };
      }

      if (!response.ok) {
        // Son sayfaya ulaştıysak veya hata varsa dur
        if (page === 0) {
          return { teams: [], error: 'API hatası' };
        }
        break;
      }

      const teams: BlueAllianceTeam[] = await response.json();
      
      // Eğer boş sayfa geldiyse dur
      if (teams.length === 0) {
        break;
      }
      
      // Takım adı, nickname veya numarasına göre filtrele
      const pageMatches = teams.filter(team => {
        const normalizedNickname = team.nickname?.toLowerCase() || '';
        const normalizedName = team.name?.toLowerCase() || '';
        const teamNumberStr = team.team_number?.toString() || '';
        
        return normalizedNickname.includes(normalizedSearchName) ||
               normalizedName.includes(normalizedSearchName) ||
               teamNumberStr.includes(normalizedSearchName);
      });

      matchingTeams.push(...pageMatches);
      
      // Yeterli sonuç bulduysak dur
      if (matchingTeams.length >= 20) {
        break;
      }
    }

    // En fazla 20 sonuç döndür
    return { teams: matchingTeams.slice(0, 20) };

  } catch (error) {
    console.error('Blue Alliance API search error:', error);
    return { teams: [], error: 'Bağlantı hatası' };
  }
}

export async function searchTeam(teamNumberOrName: string): Promise<{ teams: BlueAllianceTeam[]; error?: string }> {
  // Önce numara olarak dene
  const numberMatch = teamNumberOrName.match(/^\d+$/);
  if (numberMatch) {
    const result = await verifyTeamNumber(teamNumberOrName);
    if (result.isValid && result.team) {
      return { teams: [result.team] };
    }
  }
  
  // Numara değilse veya numara ile bulunamadıysa, ad ile ara
  return await searchTeamByName(teamNumberOrName);
}