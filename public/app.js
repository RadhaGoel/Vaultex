window.onload = () => {
      const saved = sessionStorage.getItem('vaultex_page');
      const validPages = ['dashboard', 'backup-status', 'schedules', 'logs', 'restore', 'settings'];
      const activePage = validPages.includes(saved) ? saved : 'dashboard';
      const activeNav = document.querySelector(`[onclick*="'${activePage}'"]`);
      showPage(activePage, activeNav);
    };

    function showPage(page, el) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.getElementById('page-' + page).classList.add('active');
      if (el) el.classList.add('active');
      sessionStorage.setItem('vaultex_page', page);

      if (page === 'logs') loadLogs();
      if (page === 'backup-status') loadBackupStatus();
      if (page === 'schedules') loadBackups();
      if (page === 'dashboard') loadDashboard();
    }

    async function loadDashboard() {
      const res = await fetch('/api/backups');
      const backups = await res.json();

      const total = backups.length;
      const completed = backups.filter(b => b.status === 'completed').length;
      const failed = backups.filter(b => b.status === 'failed').length;
      const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

      document.getElementById('totalBackups').textContent = total;
      document.getElementById('successRate').textContent = rate + '%';
      document.getElementById('failedJobs').textContent = failed;

      // Next Schedule fix
      const pending = backups.filter(b => b.status === 'pending');
      const subText = document.querySelector('#nextSchedule').nextElementSibling;

      if (pending.length > 0) {
        const nextBackup = pending.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];
        const next = new Date(nextBackup.scheduledAt);
        const hh = String(next.getHours()).padStart(2, '0');
        const mm = String(next.getMinutes()).padStart(2, '0');
        document.getElementById('nextSchedule').textContent = `${hh}:${mm}`;
        subText.textContent = 'Upcoming';
      } else {
        document.getElementById('nextSchedule').textContent = 'N/A';
        subText.textContent = 'No pending backups';
      }

      // Recent Activity
      const tbody = document.getElementById('recentActivity');
      if (backups.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No backups yet</td></tr>';
        return;
      }
      const sorted = [...backups].sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
      tbody.innerHTML = sorted.slice(0, 5).map(b => `
        <tr>
          <td>${b.filename}</td>
          <td><span class="badge ${b.status}">${b.status}</span></td>
          <td>${b.size > 0 ? b.size + ' KB' : '-'}</td>
          <td>${b.completedAt ? '< 1m' : '0s'}</td>
          <td>${new Date(b.scheduledAt).toLocaleString()}</td>
        </tr>
      `).join('');
    }

    async function loadBackups() {
      const res = await fetch('/api/backups');
      const backups = await res.json();
      const tbody = document.getElementById('backupList');
      if (!tbody) return;
      if (backups.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No backups found</td></tr>';
        return;
      }
      const sorted = [...backups].sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
      tbody.innerHTML = sorted.map(b => `
        <tr>
          <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${b.filename}">${b.filename}</td>
          <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${b.destination}">${b.destination}</td>
          <td><span class="badge ${b.status}">${b.status}</span></td>
          <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${b.checksum || 'N/A'}">${b.checksum ? b.checksum.substring(0,16)+'...' : 'N/A'}</td>
          <td>${new Date(b.scheduledAt).toLocaleString()}</td>
          <td style="text-align:center"><button class="btn-danger" onclick="deleteBackup('${b._id}')">Delete</button></td>
        </tr>
      `).join('');
    }

    async function loadBackupStatus() {
      const res = await fetch('/api/backups');
      const backups = await res.json();
      const container = document.getElementById('backupStatusList');
      if (backups.length === 0) {
        container.innerHTML = '<p style="color:#aaa">No backups found</p>';
        return;
      }
      const sortedStatus = [...backups].sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
      container.innerHTML = sortedStatus.map(b => {
        const pct = b.status === 'completed' ? 100 : b.status === 'running' ? 60 : b.status === 'failed' ? 20 : 10;
        return `
          <div class="status-card">
            <div class="status-header">
              <span class="status-name">${b.filename}</span>
              <span class="status-label ${b.status}">Status: ${b.status}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${b.status}" style="width:${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    function loadLogs() {
      const container = document.getElementById('logsContainer');
      container.innerHTML = 'Loading logs...';
      fetch('/api/backups').then(r => r.json()).then(backups => {
        if (backups.length === 0) {
          container.innerHTML = 'No logs available';
          return;
        }
        const sortedLogs = [...backups].sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
        container.innerHTML = sortedLogs.map(b =>
          `<p>[${new Date(b.scheduledAt).toLocaleString()}] Backup <b>${b.filename}</b> → ${b.destination} | Status: <span class="${b.status}">${b.status}</span></p>`
        ).join('');
      });
    }

    async function createBackup() {
      const filename = document.getElementById('filename').value.trim();
      const destination = document.getElementById('destination').value.trim();
      const scheduleTime = document.getElementById('scheduleTime').value;

      if (!filename || !destination) { alert('Please fill Backup Name and Source Path!'); return; }

      if (scheduleTime) {
        const selectedTime = new Date(scheduleTime);
        const now = new Date();
        if (selectedTime <= now) {
          alert('Schedule time must be in the future!');
          return;
        }

        try {
          await fetch('/api/backups/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, destination, scheduledAt: scheduleTime })
          });
        } catch(e) {}

        alert(`Backup "${filename}" scheduled for ${selectedTime.toLocaleString()}`);
        document.getElementById('filename').value = '';
        document.getElementById('destination').value = '';
        document.getElementById('scheduleTime').value = '';
        loadBackups();
        loadDashboard();
        return;
      }

      const btn = document.getElementById('startBackupBtn');
      btn.textContent = '⏳ Running...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/backups/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, destination })
        });
        const data = await res.json();
        alert(data.message);
        document.getElementById('filename').value = '';
        document.getElementById('destination').value = '';
        document.getElementById('scheduleTime').value = '';
        loadBackups();
        loadDashboard();
      } catch (e) {
        alert('Error creating backup. Make sure server is running.');
      } finally {
        btn.textContent = 'Start Backup';
        btn.disabled = false;
      }
    }

    async function recoverBackup() {
      const timestamp = document.getElementById('timestamp').value;
      if (!timestamp) { alert('Please select a date and time!'); return; }
      const res = await fetch('/api/recovery/point-in-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp })
      });
      const data = await res.json();
      const result = document.getElementById('recoveryResult');
      result.classList.remove('hidden', 'recovery-success', 'recovery-error');
      if (data.backup) {
        result.classList.add('recovery-success');
        result.innerHTML = `✅ Recovery Point Found: <b>${data.backup.filename}</b> — ${new Date(data.backup.completedAt).toLocaleString()}`;
      } else {
        result.classList.add('recovery-error');
        result.innerHTML = `❌ ${data.message}`;
      }
    }

    async function deleteBackup(id) {
      if (!confirm('Delete this backup?')) return;
      await fetch(`/api/backups/${id}`, { method: 'DELETE' });
      loadBackups();
      loadDashboard();
    }

    function runBackup() {
      document.getElementById('backupModal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('backupModal').classList.add('hidden');
    }

    async function submitModalBackup() {
      const filename = document.getElementById('modal-filename').value.trim();
      const destination = document.getElementById('modal-destination').value.trim();
      if (!filename || !destination) { alert('Fill both fields!'); return; }
      const res = await fetch('/api/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, destination })
      });
      const data = await res.json();
      alert(data.message);
      closeModal();
      loadDashboard();
    }

    function saveSettings() {
      const dir = document.getElementById('setting-dir').value.trim();
      const key = document.getElementById('setting-key').value.trim();
      const db  = document.getElementById('setting-db').value.trim();

      if (!dir || !key || !db) {
        alert('Please fill all settings fields!');
        return;
      }

      localStorage.setItem('vaultex_backup_dir', dir);
      localStorage.setItem('vaultex_db_uri', db);

      const msg = document.getElementById('settingsMsg');
      msg.classList.remove('hidden', 'settings-error');
      msg.classList.add('settings-success');
      msg.textContent = '✅ Settings saved successfully!';

      setTimeout(() => { msg.classList.add('hidden'); }, 3000);
    }

    window.addEventListener('load', () => {
      const savedDir = localStorage.getItem('vaultex_backup_dir');
      const savedDb  = localStorage.getItem('vaultex_db_uri');
      if (savedDir) document.getElementById('setting-dir').value = savedDir;
      if (savedDb)  document.getElementById('setting-db').value  = savedDb;
    });