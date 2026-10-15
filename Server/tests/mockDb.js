// Mock DB en memoria para pruebas unitarias de lógica y aislamiento de consultas
export class MockDatabase {
  constructor() {
    this.users = [];
    this.tags = [];
    this.dreams = [];
    this.dreamImages = [];
    this.dayNotes = [];
    this.idCounter = 1;
  }

  async connect() {
    return {
      query: (text, params) => this.query(text, params),
      release: () => {}
    };
  }

  async query(text, params = []) {
    const normalized = text.replace(/\s+/g, ' ').trim();

    if (normalized === 'BEGIN' || normalized === 'COMMIT' || normalized === 'ROLLBACK') {
      return { rows: [] };
    }

    // INSERT INTO users
    if (normalized.startsWith('INSERT INTO users')) {
      const user = {
        id: this.idCounter++,
        username: params[0],
        email: params[1],
        password_hash: params[2],
        avatar_url: null,
        timezone: params[3] || 'Europe/Madrid',
        created_at: new Date()
      };
      this.users.push(user);
      return { rows: [user] };
    }

    // SELECT * FROM users WHERE LOWER(email)
    if (normalized.startsWith('SELECT') && normalized.includes('FROM users WHERE LOWER(email)')) {
      const user = this.users.find(u => u.email.toLowerCase() === params[0].toLowerCase());
      return { rows: user ? [user] : [] };
    }

    // SELECT * FROM users WHERE LOWER(username)
    if (normalized.startsWith('SELECT') && normalized.includes('FROM users WHERE LOWER(username)')) {
      const user = this.users.find(u => u.username.toLowerCase() === params[0].toLowerCase());
      return { rows: user ? [user] : [] };
    }

    // SELECT ... FROM users WHERE id
    if (normalized.startsWith('SELECT') && normalized.includes('FROM users WHERE id = $1')) {
      const user = this.users.find(u => u.id === params[0]);
      return { rows: user ? [user] : [] };
    }

    // UPDATE users (perfil o contraseña)
    if (normalized.startsWith('UPDATE users')) {
      const user = this.users.find(u => u.id === params[0]);
      if (user) {
        if (normalized.includes('password_hash = $2')) {
          user.password_hash = params[1];
        } else {
          if (params[1]) user.username = params[1];
          if (params[2] && normalized.includes('email = COALESCE')) user.email = params[2];
          if (params[3] && normalized.includes('timezone = COALESCE')) user.timezone = params[3];
          if (params[4] && normalized.includes('gender = COALESCE')) user.gender = params[4];
          if (typeof params[5] === 'boolean') user.track_cycle = params[5];
        }
      }
      return { rows: user ? [user] : [] };
    }

    // DELETE FROM users
    if (normalized.startsWith('DELETE FROM users WHERE id = $1')) {
      const idx = this.users.findIndex(u => u.id === params[0]);
      if (idx !== -1) {
        const deleted = this.users.splice(idx, 1)[0];
        return { rows: [deleted] };
      }
      return { rows: [] };
    }

    // INSERT INTO tags
    if (normalized.startsWith('INSERT INTO tags')) {
      const tag = {
        id: this.idCounter++,
        user_id: params[0],
        name: params[1],
        initials: params[2],
        color: params[3],
        is_default: !!params[4],
        is_archived: false,
        created_at: new Date()
      };
      this.tags.push(tag);
      return { rows: [tag] };
    }

    // SELECT ... FROM tags WHERE id = $1 AND user_id = $2
    if (normalized.startsWith('SELECT') && normalized.includes('FROM tags') && normalized.includes('WHERE id = $1 AND user_id = $2')) {
      const tag = this.tags.find(t => t.id === params[0] && t.user_id === params[1]);
      return { rows: tag ? [tag] : [] };
    }

    // SELECT ... FROM tags WHERE user_id
    if (normalized.startsWith('SELECT') && normalized.includes('FROM tags') && normalized.includes('WHERE user_id = $1')) {
      let filtered = this.tags.filter(t => t.user_id === params[0]);
      if (normalized.includes('is_archived = false')) {
        filtered = filtered.filter(t => !t.is_archived);
      }
      return { rows: filtered };
    }

    // UPDATE tags SET is_archived = true
    if (normalized.startsWith('UPDATE tags') && normalized.includes('is_archived = true')) {
      const tag = this.tags.find(t => t.id === params[0] && t.user_id === params[1]);
      if (tag) tag.is_archived = true;
      return { rows: tag ? [tag] : [] };
    }

    // DELETE FROM tags WHERE id = $1 AND user_id = $2
    if (normalized.startsWith('DELETE FROM tags WHERE id = $1 AND user_id = $2')) {
      const idx = this.tags.findIndex(t => t.id === params[0] && t.user_id === params[1]);
      if (idx !== -1) {
        const deleted = this.tags.splice(idx, 1)[0];
        return { rows: [deleted] };
      }
      return { rows: [] };
    }

    // INSERT INTO dreams
    if (normalized.startsWith('INSERT INTO dreams')) {
      const dream = {
        id: this.idCounter++,
        user_id: params[0],
        title: params[1],
        dream_date: params[2],
        dream_time: params[3],
        tag_id: params[4],
        content: params[5],
        symbolisms: params[6],
        characters: params[7],
        places: params[8],
        notes: params[9],
        moon_phase_name: params[10],
        moon_phase_emoji: params[11],
        moon_zodiac_sign: params[12],
        moon_zodiac_symbol: params[13],
        created_at: new Date()
      };
      this.dreams.push(dream);
      return { rows: [dream] };
    }

    // SELECT single dream WHERE d.id = $1 AND d.user_id = $2
    if (normalized.startsWith('SELECT') && normalized.includes('FROM dreams d') && normalized.includes('WHERE d.id = $1 AND d.user_id = $2')) {
      const dream = this.dreams.find(d => d.id === params[0] && d.user_id === params[1]);
      return { rows: dream ? [{ ...dream, images: [] }] : [] };
    }

    // SELECT COUNT dreams
    if (normalized.startsWith('SELECT') && normalized.includes('COUNT') && normalized.includes('FROM dreams d') && normalized.includes('WHERE d.user_id = $1')) {
      const count = this.dreams.filter(d => d.user_id === params[0]).length;
      return { rows: [{ total: count }] };
    }

    // SELECT dreams
    if (normalized.startsWith('SELECT') && (normalized.includes('FROM dreams d') || normalized.includes('FROM dreams')) && (normalized.includes('WHERE d.user_id = $1') || normalized.includes('WHERE user_id = $1'))) {
      let result = this.dreams.filter(d => d.user_id === params[0]);
      // Ordenamiento por dream_date DESC, dream_time ASC
      result.sort((a, b) => {
        if (a.dream_date !== b.dream_date) {
          return a.dream_date > b.dream_date ? -1 : 1;
        }
        return a.dream_time < b.dream_time ? -1 : 1;
      });
      return { rows: result.map(d => ({ ...d, images: [] })) };
    }

    // UPDATE dreams SET tag_id = NULL
    if (normalized.startsWith('UPDATE dreams') && normalized.includes('SET tag_id = NULL WHERE tag_id = $1 AND user_id = $2')) {
      for (const d of this.dreams) {
        if (d.tag_id === params[0] && d.user_id === params[1]) {
          d.tag_id = null;
        }
      }
      return { rows: [] };
    }

    // UPDATE dreams (general)
    if (normalized.startsWith('UPDATE dreams')) {
      const dream = this.dreams.find(d => d.id === params[0] && d.user_id === params[1]);
      if (!dream) return { rows: [] };

      if (normalized.includes('dream_time =')) {
        const timeMatch = normalized.match(/dream_time = \$(\d+)/);
        if (timeMatch) {
          dream.dream_time = params[Number(timeMatch[1]) - 1];
        }
      }
      dream.title = params[2];
      dream.tag_id = params[3];
      dream.content = params[4];
      return { rows: [dream] };
    }

    // DELETE FROM dreams WHERE id = $1 AND user_id = $2
    if (normalized.startsWith('DELETE FROM dreams WHERE id = $1 AND user_id = $2')) {
      const idx = this.dreams.findIndex(d => d.id === params[0] && d.user_id === params[1]);
      if (idx !== -1) {
        const deleted = this.dreams.splice(idx, 1)[0];
        return { rows: [deleted] };
      }
      return { rows: [] };
    }

    // SELECT file_path FROM dream_images WHERE dream_id
    if (normalized.startsWith('SELECT') && normalized.includes('FROM dream_images WHERE dream_id = $1 AND user_id = $2')) {
      const imgs = this.dreamImages.filter(di => di.dream_id === params[0] && di.user_id === params[1]);
      return { rows: imgs };
    }

    // COUNT tag usage
    if (normalized.startsWith('SELECT') && normalized.includes('COUNT(*)::int AS count FROM dreams WHERE tag_id = $1 AND user_id = $2')) {
      const count = this.dreams.filter(d => d.tag_id === params[0] && d.user_id === params[1]).length;
      return { rows: [{ count }] };
    }

    return { rows: [] };
  }
}
