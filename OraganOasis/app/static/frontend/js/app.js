// Minimal frontend app logic for Organ Oasis
(function(){
  const storageKey = 'organ_oasis_data_v1';
  const defaultData = {
    hospitals: [
      {id:1,name:'Demo Hospital',email:'demo@hospital.test',contact:'+1 555 000',district:'Chennai'},
      {id:2,name:'City General Hospital',email:'citygen@example.com',contact:'+91 98765 43210',district:'Mumbai'},
      {id:3,name:"St. Jude's Hospital",email:'stjude@example.com',contact:'+91 91234 56789',district:'Bengaluru'},
      {id:4,name:'Apollo Medical Center',email:'apollo@example.com',contact:'+91 99887 77665',district:'Chennai'}
    ],
    donors: [
      // active
      {id:1, hospital:'Demo Hospital', patient_id:'P001', organ:'Kidney', blood:'A+', expiry: new Date(Date.now()+2*24*3600*1000).toISOString(), location:'Chennai', contact:'+91 90000', email:'demo@hospital.test'},
      {id:2, hospital:'City General Hospital', patient_id:'CG-204', organ:'Liver', blood:'B+', expiry: new Date(Date.now()+5*24*3600*1000).toISOString(), location:'Mumbai', contact:'+91 98765 43210', email:'citygen@example.com'},
      {id:3, hospital:"St. Jude's Hospital", patient_id:'SJ-78', organ:'Heart', blood:'O-', expiry: new Date(Date.now()+12*3600*1000).toISOString(), location:'Bengaluru', contact:'+91 91234 56789', email:'stjude@example.com'},
      {id:4, hospital:'Apollo Medical Center', patient_id:'AP-900', organ:'Cornea', blood:'A-', expiry: new Date(Date.now()+30*24*3600*1000).toISOString(), location:'Chennai', contact:'+91 99887 77665', email:'apollo@example.com'},
      // expiring / expired
      {id:5, hospital:'City General Hospital', patient_id:'CG-199', organ:'Kidney', blood:'A+', expiry: new Date(Date.now()-2*24*3600*1000).toISOString(), location:'Mumbai', contact:'+91 98765 43210', email:'citygen@example.com'},
      {id:6, hospital:'Demo Hospital', patient_id:'P010', organ:'Lungs', blood:'AB+', expiry: new Date(Date.now()+6*3600*1000).toISOString(), location:'Chennai', contact:'+91 90000', email:'demo@hospital.test'},
      {id:7, hospital:"St. Jude's Hospital", patient_id:'SJ-81', organ:'Pancreas', blood:'B-', expiry: new Date(Date.now()+48*3600*1000).toISOString(), location:'Bengaluru', contact:'+91 91234 56789', email:'stjude@example.com'}
    ],
    transfers: [
      {id:1, out:{organ_type:'Kidney', vehicle_type:'Ambulance', vehicle_no:'MH12AB1234', dispatch_time:new Date(Date.now()-6*3600*1000).toISOString(), sender_name:'Rajesh K', signature:'Rajesh'}, in:{arrival_time:new Date(Date.now()-2*3600*1000).toISOString(), receiver_name:'Dr. Meera', signature:'Meera'}, summary:'Kidney transfer from City General to Demo Hospital'},
    ],
    notifications: [
      'Donor P001 (Kidney) added to Demo Hospital',
      'Transfer completed: Kidney (CG-204)',
      'Organ expiring soon: SJ-78 (Heart)'
    ]
  };

  function load(){
    const raw = localStorage.getItem(storageKey);
    if(raw) return JSON.parse(raw);
    localStorage.setItem(storageKey, JSON.stringify(defaultData));
    return JSON.parse(localStorage.getItem(storageKey));
  }
  function save(data){ localStorage.setItem(storageKey, JSON.stringify(data)); }

  // Theme
  function applyTheme(theme){ document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('oo_theme', theme); }
  function toggleTheme(){ const t = localStorage.getItem('oo_theme')==='dark' ? 'light' : 'dark'; applyTheme(t); }
  document.addEventListener('DOMContentLoaded', ()=>{
    const theme = localStorage.getItem('oo_theme')||'light'; applyTheme(theme);
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('themeToggleFooter')?.addEventListener('click', toggleTheme);
    document.getElementById('themeToggleDash')?.addEventListener('click', toggleTheme);
    document.getElementById('themeToggleSettings')?.addEventListener('click', toggleTheme);

    // Initialize pages
    const path = location.pathname || ''; initPage(path);
  });

  // Navigation helper
  window.go = function(url){ location.href = url; };

  // Signup
  document.addEventListener('submit', function(e){
    if(e.target && e.target.id==='signupForm'){
      e.preventDefault();
      const f = e.target; const d = load();
      const obj = { id: Date.now(), name:f.hospital.value, email:f.email.value, contact:f.contact.value, district:f.district.value };
      d.hospitals.push(obj); save(d);
      alert('Hospital registered — you can now login');
      location.href='/frontend/login.html';
    }
  });

  // Login
  document.addEventListener('submit', function(e){
    if(e.target && e.target.id==='loginForm'){
      e.preventDefault();
      const f = e.target; const d = load();
      // Simple matching by email
      const hospital = d.hospitals.find(h=>h.email===f.email.value) || d.hospitals[0];
      localStorage.setItem('oo_current_hospital', JSON.stringify(hospital));
      location.href='/frontend/dashboard.html';
    }
  });

  // Dashboard init
  function initPage(path){
    if(path.endsWith('dashboard.html')){ initDashboard(); }
    if(path.endsWith('add_donor.html')){ initAddDonor(); }
    if(path.endsWith('availability.html')){ initAvailability(); }
    if(path.endsWith('ai_search.html')){ initAISearch(); }
    if(path.endsWith('transfer_report.html')){ initTransferReport(); }
    if(path.endsWith('settings.html')){ initSettings(); }
    if(path.endsWith('home.html')|| path==='/'){
      // nothing special
    }
  }

  function getCurrentHospital(){ return JSON.parse(localStorage.getItem('oo_current_hospital')||'null') || load().hospitals[0]; }

  // Dashboard rendering
  function initAddDonor(){
    const form = document.getElementById('addDonorForm');
    const hosp = getCurrentHospital();
    const msgBox = document.getElementById('addDonorMsg');
    const expiryHelp = document.getElementById('expiryHelp');
    
    // Set hospital name
    document.getElementById('hospitalAuto').value = hosp.name;

    // Set minimum expiry time to now
    const now = new Date();
    const expiry = document.querySelector('input[name="expiry"]');
    expiry.min = now.toISOString().slice(0, 16);
    
    // Update expiry help text with time remaining
    expiry.addEventListener('input', () => {
      const selected = new Date(expiry.value);
      const hours = Math.round((selected - now) / (60 * 60 * 1000));
      expiryHelp.textContent = `Organ will remain viable for ${hours} hours`;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Validate expiry time
      if (new Date(data.expiry) <= now) {
        showMessage('Expiry time must be in the future', 'error');
        return;
      }

      // Add to donors list
      const d = load();
      const donor = {
        id: Date.now(),
        hospital: hosp.name,
        patient_id: data.patient_id,
        donor_name: data.donor_name,
        organ: data.organ,
        blood: data.blood,
        expiry: new Date(data.expiry).toISOString(),
        location: data.district,
        contact: data.contact,
        email: hosp.email,
        notes: data.notes
      };
      
      d.donors.push(donor);
      d.notifications.push(`New ${donor.organ} donor added from ${hosp.name}`);
      save(d);

      showMessage('Donor added successfully! Redirecting to availability page...', 'success');
      setTimeout(() => location.href = '/frontend/availability.html', 2000);
    });

    function showMessage(text, type) {
      msgBox.textContent = text;
      msgBox.className = `message-box ${type}`;
    }
  }

  function initDashboard(){
    const d = load(); const hosp = getCurrentHospital();
    document.getElementById('hospitalName').textContent = hosp.name;
    
    // Update stats
    const now = new Date();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    // Calculate statistics
    const totalDonors = d.donors.length;
    const availableOrgans = d.donors.filter(d => new Date(d.expiry) > now).length;
    const completedTransfers = d.transfers.length;
    const expiringOrgans = d.donors.filter(d => {
      const expiry = new Date(d.expiry);
      return expiry > now && (expiry - now) <= ONE_DAY;
    }).length;

    // Update stat cards
    document.getElementById('totalDonors').textContent = totalDonors;
    document.getElementById('availableOrgans').textContent = availableOrgans;
    document.getElementById('completedTransfers').textContent = completedTransfers;
    document.getElementById('expiringOrgans').textContent = expiringOrgans;

    // Update colors based on expiring organs
    const expiringCard = document.getElementById('expiringOrgansCard');
    if(expiringOrgans > 0) {
      expiringCard.querySelector('.stat-icon').style.background = '#ef4444';
    }

    renderAvailabilityTable(); 
    renderNotifications();
    document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ localStorage.removeItem('oo_current_hospital'); location.href='/frontend/login.html'; });
  }
  function renderStats(){ const d=load(); const donors=d.donors; const donorsForHosp=donors.filter(x=>x.hospital===getCurrentHospital().name);
    const total = donorsForHosp.length; const organs = donorsForHosp.filter(x=>new Date(x.expiry)>new Date()).length; const transfers = load().transfers.length; const expiring = donorsForHosp.filter(x=> (new Date(x.expiry)-Date.now())<48*3600*1000 && (new Date(x.expiry)-Date.now())>0 ).length;
    const root = document.getElementById('statsRoot'); if(!root) return;
    root.innerHTML = `
      <div class="card"><h4>Total Donors</h4><div class="stat">${total}</div></div>
      <div class="card"><h4>Organs Available</h4><div class="stat">${organs}</div></div>
      <div class="card"><h4>Transfers Completed</h4><div class="stat">${transfers}</div></div>
      <div class="card"><h4>Expiring Soon</h4><div class="stat">${expiring}</div></div>
    `;
  }

  function renderAvailabilityTable(){ const d = load(); const tbody = document.querySelector('#availabilityTable tbody'); if(!tbody) return; tbody.innerHTML='';
    d.donors.forEach(row=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${row.organ}</td><td>${row.blood||''}</td><td>${new Date(row.expiry).toLocaleString()}</td><td>${new Date(row.expiry)>new Date() ? 'Active' : 'Expired'}</td><td>${row.hospital}</td>`;
      tbody.appendChild(tr);
    });
  }

  function renderNotifications(){ const d=load(); const ul=document.getElementById('notificationsList'); if(!ul) return; ul.innerHTML=''; d.notifications.slice().reverse().forEach(n=>{ const li=document.createElement('li'); li.textContent = n; ul.appendChild(li); }); }

  // Add Donor page
  function initAddDonor(){ const form = document.getElementById('addDonorForm'); if(!form) return; const hosp = getCurrentHospital(); document.getElementById('hospitalAuto').value = hosp.name;
    form.addEventListener('submit', function(e){ e.preventDefault(); const fd = new FormData(form); const obj = { id:Date.now(), hospital:fd.get('hospital')||hosp.name, patient_id:fd.get('patient_id'), organ:fd.get('organ'), blood:fd.get('blood'), expiry: new Date(fd.get('expiry')).toISOString(), location:fd.get('district'), contact:fd.get('contact'), email:hosp.email };
      const d=load(); d.donors.push(obj); d.notifications.push(`New donor added: ${obj.organ} (${obj.blood}) at ${obj.hospital}`); save(d);
      document.getElementById('addDonorMsg').textContent = 'Donor added successfully!'; renderStats();
      setTimeout(()=> location.href='/frontend/dashboard.html',1200);
    });
  }

  // Availability page
  function initAvailability(){ renderFullAvailability(); populateFilters(); }
  function renderFullAvailability(){ const d=load(); const tbody=document.querySelector('#fullAvailabilityTable tbody'); tbody.innerHTML=''; d.donors.forEach(r=>{ const tr=document.createElement('tr'); tr.innerHTML = `<td>${r.hospital}</td><td>${r.patient_id}</td><td>${r.organ}</td><td>${r.blood||''}</td><td>${new Date(r.expiry).toLocaleString()}</td><td>${r.location||''}</td><td>${r.contact||''}</td><td><a href="mailto:${r.email}">${r.email}</a></td><td>${new Date(r.expiry)>new Date() ? 'Active' : 'Expired'}</td>`; tbody.appendChild(tr); }); startExpiryTimers(); }
  function populateFilters(){ const d=load(); const dist=document.getElementById('filterDistrict'); const organ=document.getElementById('filterOrgan'); const blood=document.getElementById('filterBlood'); if(!dist) return; const districts = [...new Set(d.donors.map(x=>x.location))]; districts.forEach(dt=>{ const o=document.createElement('option'); o.value=dt;o.textContent=dt;dist.appendChild(o);}); const organs = [...new Set(d.donors.map(x=>x.organ))]; organs.forEach(it=>{ const o=document.createElement('option'); o.value=it; o.textContent=it; organ.appendChild(o);}); const bloods = [...new Set(d.donors.map(x=>x.blood))]; bloods.forEach(it=>{ const o=document.createElement('option'); o.value=it; o.textContent=it; blood.appendChild(o);}); }
  function renderAvailability(){ const q=document.getElementById('searchBox')?.value||''; const d=load(); const tbody=document.querySelector('#fullAvailabilityTable tbody'); tbody.innerHTML=''; const district=document.getElementById('filterDistrict')?.value; const organ=document.getElementById('filterOrgan')?.value; const blood=document.getElementById('filterBlood')?.value; let rows=d.donors.filter(r=>(!district||r.location===district)&&(!organ||r.organ===organ)&&(!blood||r.blood===blood)); if(q){ rows=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(q.toLowerCase())); } rows.forEach(r=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${r.hospital}</td><td>${r.patient_id}</td><td>${r.organ}</td><td>${r.blood||''}</td><td>${new Date(r.expiry).toLocaleString()}</td><td>${r.location||''}</td><td>${r.contact||''}</td><td><a href="mailto:${r.email}">${r.email}</a></td><td>${new Date(r.expiry)>new Date() ? 'Active' : 'Expired'}</td>`; tbody.appendChild(tr); }); startExpiryTimers(); }

  function requestFullReport(){ alert('Full report requested — generating (simulated)'); }

  // AI
  function initAISearch(){ document.getElementById('aiSearchInput')?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') aiSearchPageQuery(); }); }
  window.aiSearchPageQuery = function(){ const q=document.getElementById('aiSearchInput').value; const res = aiSearch(q); const out=document.getElementById('aiSearchResults'); out.innerHTML=''; res.forEach(r=>{ const div=document.createElement('div'); div.className='card'; div.innerHTML = `<div><strong>${r.organ}</strong> (${r.blood}) - ${r.hospital} - ${new Date(r.expiry).toLocaleString()}</div><div>${r.location}</div><div><button class="btn small" onclick="go('/frontend/availability.html')">View Details</button></div>`; out.appendChild(div); }); }
  window.aiQuery = function(){ const q = document.getElementById('aiInput').value; const w = document.querySelector('#aiWidget .messages'); const bot = document.createElement('div'); bot.className='user'; bot.textContent=q; w.appendChild(bot); const res = aiSearch(q); setTimeout(()=>{ const d = document.createElement('div'); d.className='bot'; d.textContent = (res.length? `Found ${res.length} match(es).` : 'No matches found.'); w.appendChild(d); w.scrollTop = w.scrollHeight; },600); }
  function aiSearch(query){ const d = load(); if(!query) return d.donors.slice(0,5); query = query.toLowerCase(); const words = query.split(/\s+/); return d.donors.filter(r=> words.every(w=> JSON.stringify(r).toLowerCase().includes(w))).slice(0,10); }

  // Transfer & report
  window.saveTransferOut = function(){ const f=document.getElementById('transferOutForm'); const fd = new FormData(f); const out = {}; fd.forEach((v,k)=> out[k]=v); const d = load(); d.transfers.push({out}); save(d); alert('Transfer out saved'); }
  window.saveTransferIn = function(){ const f=document.getElementById('transferInForm'); const fd = new FormData(f); const inR = {}; fd.forEach((v,k)=> inR[k]=v); const d = load(); d.transfers.push({in:inR}); save(d); const report = document.getElementById('transferReport'); report.innerHTML = `<div class="card"><h4>Transfer Summary</h4><pre>${JSON.stringify(d.transfers.slice(-2),null,2)}</pre></div>`; }

  // Settings
  function initSettings(){ const hosp = getCurrentHospital(); document.getElementById('editEmail').value = hosp.email; document.getElementById('editContact').value = hosp.contact; document.getElementById('editLocation').value = hosp.district; }
  window.saveHospitalInfo = function(){ const d = load(); const hosp = getCurrentHospital(); hosp.email = document.getElementById('editEmail').value; hosp.contact = document.getElementById('editContact').value; hosp.district = document.getElementById('editLocation').value; // persist
    const all = load(); const i = all.hospitals.findIndex(h=>h.id===hosp.id); if(i>=0) all.hospitals[i]=hosp; save(all); localStorage.setItem('oo_current_hospital', JSON.stringify(hosp)); alert('Saved'); }
  window.changePassword = function(){ alert('Password changed (simulated)'); }
  window.logout = function(){ localStorage.removeItem('oo_current_hospital'); location.href='/frontend/login.html'; }

  // expiry timers
  function startExpiryTimers(){ // no-op simple
    document.querySelectorAll('#fullAvailabilityTable tbody tr').forEach(tr=>{ const td = tr.children[4]; const expiry = new Date(td.textContent); const statusTd = tr.children[8]; if(expiry>new Date()) statusTd.textContent='Active'; else statusTd.textContent='Expired'; }); }

  // init functions used in some pages
  window.initPage = initPage; window.aiSearch = aiSearch; window.initDashboard = initDashboard; window.initAvailability = initAvailability; window.initAddDonor = initAddDonor; window.renderAvailability = renderAvailability;
})();