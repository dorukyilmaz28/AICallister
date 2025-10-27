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
