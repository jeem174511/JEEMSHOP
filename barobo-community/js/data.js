/* data.js — sample data only. Replace it with verified information. */
(function (B) {
  const d = B.utils.daysFromNow;

  const news = [
    {
      id: 'n9', category: 'News', hue: 170, date: '2026-10-23', dateEnd: '2026-10-24',
      image: 'assets/ing-barobo-issue-03-page-01.png',
      images: [
        'assets/ing-barobo-issue-03-page-01.png',
        'assets/ing-barobo-issue-03-page-02.png',
        'assets/ing-barobo-issue-03-page-03.png',
        'assets/ing-barobo-issue-03-page-04.png',
        'assets/ing-barobo-issue-03-page-05.png'
      ],
      title: 'ING BAROBO Issue 03: October 23–24, 2026',
      summary: 'Read highlights from the October issue of ING BAROBO, the official publication of the Municipality of Barobo. This retrospective issue covers the Sarapang Festival finale, Barobo’s Best, the job fair and medical mission, the Children’s Park opening, the provincial transport terminal turnover, and community voices behind the celebration.',
      body: [
        'ING BAROBO Issue 03, dated October 23–24, 2026, brings together reports and reflections from the 66th Araw ng Barobo and 10th Sarapang Festival.',
        'The issue looks back at the festival finale, including Sidong Sa Dan’s showcase of Manobo and Mandaya heritage, Barobo’s Best, the job fair, and the medical mission. It also reports on the opening of the Children’s Park and the turnover of the provincial transport terminal to the Barobo LGU.',
        'Its opinion pages recognize the people and teamwork behind the festival, and reflect on how community journalism preserves local stories and public memory.'
      ]
    },
    {
      id: 'n8', category: 'News', hue: 170, date: '2026-10-24',
      image: 'assets/barobo-childrens-park-opening.png',
      title: 'Barobo Children’s Park Is Now Open',
      summary: 'Barobohanons, our children\'s park is now open! Come on over and play—it’s free for the kids.',
      body: [
        'Barobohanons, our children\'s park is now open! Come on over and play—it’s free for the kids.'
      ]
    },
    {
      id: 'n7', category: 'News', hue: 170, date: '2026-11-01', dateEnd: '2026-11-02',
      image: 'assets/barobo-oplan-undas-assistance.png',
      title: 'Barobo Activates Oplan Undas Public Assistance Stations',
      summary: 'The Local Government Unit of Barobo successfully conducted the activation of Oplan Undas, in coordination with various national government agencies and LGU offices, which established multiple Public Assistance Stations at strategic locations across the municipality. The initiative aimed to ensure the safety, security, and convenience of residents and visiting guests during the observance of All Saints’ Day and All Souls’ Day. The established assistance stations provided essential services, including security and safety assistance, medical support, and tourism-related information and guidance.',
      body: [
        'The Local Government Unit of Barobo successfully conducted the activation of Oplan Undas, in coordination with various national government agencies and LGU offices, which established multiple Public Assistance Stations at strategic locations across the municipality.',
        'The initiative aimed to ensure the safety, security, and convenience of residents and visiting guests during the observance of All Saints’ Day and All Souls’ Day. The established assistance stations provided essential services, including security and safety assistance, medical support, and tourism-related information and guidance.'
      ]
    },
    {
      id: 'n6', category: 'Education', hue: 260, date: '2026-11-03',
      image: 'assets/barobo-deped-teachers-appreciation.png',
      title: 'Mayor Martizano Recognizes DepEd Teachers During Araw ng Barobo',
      summary: 'Municipal Mayor Hon. Ronito L. Martizano personally met with the Department of Education (DepEd) Teachers and students in-charge of the ING BAROBO | The Official Publication of the Municipality during the celebration of the 66th Araw ng Barobo and 10th Sarapang Festival. During the meeting, Mayor Martizano expressed his heartfelt gratitude and appreciation for the teachers’ valuable contributions and support to the successful conduct of the municipality’s festival celebration. As a gesture of recognition, the Local Chief Executive personally awarded them Certificates of Appreciation in acknowledgment of their dedication and involvement.',
      body: [
        'Municipal Mayor Hon. Ronito L. Martizano personally met with the Department of Education (DepEd) Teachers and students in-charge of the ING BAROBO | The Official Publication of the Municipality during the celebration of the 66th Araw ng Barobo and 10th Sarapang Festival.',
        'During the meeting, Mayor Martizano expressed his heartfelt gratitude and appreciation for the teachers’ valuable contributions and support to the successful conduct of the municipality’s festival celebration. As a gesture of recognition, the Local Chief Executive personally awarded them Certificates of Appreciation in acknowledgment of their dedication and involvement.'
      ]
    },
    {
      id: 'n5', category: 'News', hue: 170, date: '2026-11-05',
      image: 'assets/barobo-community-meeting.png',
      title: 'Barobo Officials Meet with Former Ilocos Sur Governor Chavit Singson',
      summary: 'Municipal Mayor Hon. Ronito L. Martizano, together with Municipal Agriculturist Mr. Johnny Ramos, Zoning Officer Engr. Leoman Salvaña, Consultant Dr. Randell Espina, and Barobo First Lady Ms. Agnes Martizano, held a meeting with former Ilocos Sur Governor Hon. Chavit Singson to explore potential areas of collaboration for future developmental projects in the Municipality of Barobo. The meeting served as an opportunity to discuss possible partnerships and initiatives that could contribute to Barobo’s continuing development and improve the delivery of services to its constituents.',
      body: [
        'Municipal Mayor Hon. Ronito L. Martizano, together with Municipal Agriculturist Mr. Johnny Ramos, Zoning Officer Engr. Leoman Salvaña, Consultant Dr. Randell Espina, and Barobo First Lady Ms. Agnes Martizano, held a meeting with former Ilocos Sur Governor Hon. Chavit Singson to explore potential areas of collaboration for future developmental projects in the Municipality of Barobo.',
        'The meeting served as an opportunity to discuss possible partnerships and initiatives that could contribute to Barobo’s continuing development and improve the delivery of services to its constituents.'
      ]
    },
  ];
  news.sort(function (a, b) {
    return B.utils.toDate(b.date) - B.utils.toDate(a.date);
  });

  const events = [
    {
      id: 'e1', title: '10th Sarapang Festival and 66th Araw ng Barobo 2026', date: '2026-11-08', time: 'To be announced', hideDate: true,
      place: 'Barobo, Surigao del Sur', category: 'Festival', going: 0,
      image: 'assets/barobo-sarapang-festival-2026.png',
      desc: '1 DAY TO GO!\n\nThe wait is almost over! Get ready to witness the vibrant colors, rich traditions, and festive spirit that bring our community together as one!\n\nTomorrow, we will officially kick off the 10th Sarapang Festival and 66th Araw ng Barobo 2026!\n\nLet us make this celebration a memorable one as we proudly showcase the culture, unity, and pride of every Barobohanon!'
    },
    {
      id: 'e4', title: 'Pahugyaw sa Bogac Cold Spring', date: '2026-11-19', hideDate: true,
      time: 'To be announced', place: 'Bogac Cold Spring, Barobo', category: 'Festival', going: 0,
      image: 'assets/pahugyaw-bogac-cold-spring-2026.png',
      desc: 'PAHUGYAW SA BOGAC COLD SPRING!\n\nWhere music meets magic, and every night becomes a celebration. See you for a spectacular fusion of rhythm, energy, and Barobohanons’ vibrant spirit!'
    },
    {
      id: 'e5', title: '66th Araw ng Barobo and 10th Sarapang Festival — October 23 Program',
      date: '2026-10-23', endDate: '2026-10-24', hideDate: true,
      time: 'See schedule', place: 'Various locations in Barobo', category: 'Festival', going: 0,
      images: [
        'assets/sarapang-job-fair-2026.png',
        'assets/sarapang-medical-mission-2026.png',
        'assets/sarapang-motocross-2026.png',
        'assets/sarapang-barobos-best-2026.png',
        'assets/sarapang-hudyaka-sing-dum-2026.png'
      ],
      desc: 'The celebration continues for the 66th Araw ng Barobo and 10th Sarapang Festival this October 23, 2026, with a full day of service, opportunities, talent, and entertainment!\n\nToday’s festival highlights:\n- One-Stop-Shop Job Fair | 8:00 AM–3:00 PM | Municipal Gymnasium\n- Halad sa Barobohanon Medical Mission | 8:00 AM–5:00 PM | Municipal Gymnasium\n- Motocross | 9:30 AM–5:00 PM, October 23–24 | New Government Center, San Vicente, Barobo, Surigao del Sur\n- Barobo’s Best | 7:00–9:00 PM | Municipal Gymnasium\n- Hudyaka Sing Dum: 2nd Night, featuring Hightimes Music | 9:00 PM–12:00 midnight | Municipal Gymnasium\n\nFrom meaningful public service to thrilling competition and lively entertainment, let us celebrate the talents, unity, and vibrant spirit of every Barobohanon!'
    }
  ];

  const directory = [
    {
      id: 'd2', name: 'Barobo Police Station', category: 'Emergency', barangay: 'Poblacion',
      phone: '0946-355-6267', hours: '24 hours',
      note: '#Bagong PNP para sa Bagong Pilipinas: Serbisyong Mabilis, Tapat at Nararamdaman #ToServeandProtect',
      logo: 'assets/barobo-police-station-logo.png',
      image: 'assets/barobo-police-station-hotline.png'
    },
    {
      id: 'd3', name: 'Barobo Fire Station', category: 'Emergency', barangay: 'Poblacion',
      phone: '0931-721-8753', hours: '24 hours',
      note: 'In case of Fire and Emergency pls. call: 0931-721-8753 (TNT)',
      logo: 'assets/barobo-fire-station-logo.png',
      image: 'assets/barobo-fire-station-oplan-kaluluwa-2026.png'
    },
    {
      id: 'd10', name: 'MDRRM BAROBO', category: 'Emergency', barangay: 'Poblacion',
      hours: '24 hours',
      note: 'For emergencies, alerts, and disaster updates, contact us anytime:',
      logo: 'assets/mdrrm-barobo-logo.png',
      contacts: [
        { label: 'SMART/TNT', value: '(0970) 365 3505', href: 'tel:+639703653505' },
        { label: 'GLOBE', value: '(0945) 543 1857', href: 'tel:+639455431857' },
        { label: 'Email', value: 'mdrrm.barobo@gmail.com', href: 'mailto:mdrrm.barobo@gmail.com' },
        { label: 'Facebook', value: 'MDRRM Barobo' }
      ]
    },
    {
      id: 'd4', name: 'Barobo Municipal Health Office', category: 'Health', barangay: 'Poblacion',
      phone: '', hours: 'Mon–Fri, 8 AM–5 PM',
      note: 'The Barobo Municipal Health Office is a DOH accredited Primary Care Facility and a PhilHealth accredited YAKAP provider.',
      logo: 'assets/barobo-municipal-health-office-logo.png',
      image: 'assets/barobo-municipal-health-office-team.png'
    },
    {
      id: 'd11', name: 'MSWD BAROBO', category: 'Government', barangay: 'Poblacion',
      phone: '', hours: '',
      note: '#PaspasUgPulido #MSWDBarobo #DSWDKalingaAtPagmamahal #DSWDMayMalasakit #iLoveBarobo #LGUBarobo',
      logo: 'assets/mswd-barobo-logo.png'
    },
    {
      id: 'd12', name: 'Barobo Surigao Tourism Official', category: 'Tourism',
      note: 'Discover Barobo’s local destinations, culture, and tourism updates.',
      logo: 'assets/barobo-surigao-tourism-logo.png'
    }
  ];

  B.data = { news, events, directory };
})(window.Barobo = window.Barobo || {});
