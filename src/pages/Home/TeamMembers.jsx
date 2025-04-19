const TeamMemberCard = ({ image, name, role }) => (
    <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
      <img className="w-[330px] h-[320px] object-cover" src={image} alt="members" />
      <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">{name}</h2>
      <h2 className="justify-center mt-2 text-center text-xl font-lato">{role}</h2>
    </div>
  );
  
  const TeamSection = ({ members }) => (
    <div className="flex gap-15 justify-center items-center">
      {members.map((member, index) => (
        <TeamMemberCard key={index} image={member.image} name={member.name} role={member.role} />
      ))}
    </div>
  );
  
  const teamData = [
    [
      { image: "/Matt.jpg", name: "Matt Henry Buenaventura", role: "System Developer" },
      { image: "/Ian.jpg", name: "Ian Angelo Valmores", role: "System Developer" },
      { image: "/Frivs.jpg", name: "Adrian Frivaldo", role: "System Developer" },
    ],
    [
      { image: "/Jr.jpg", name: "Ricky Galanza Jr.", role: "System Developer" },
      { image: "/Juan.jpg", name: "Juan Carlo Dela Cruz", role: "System Developer" },
      { image: "/Dave.jpg", name: "Christian Dave Juliales", role: "System Developer" },
    ],
    [
      { image: "/Charles.jpg", name: "Charles Kirby A. Valencia", role: "UI Designer" },
      { image: "/Errol.jpg", name: "John Errol Sebial", role: "UI Designer" },
      { image: "/Kat.jpg", name: "Kath Serzo", role: "UI Designer" },
    ],
    [
      { image: "/Diane.jpg", name: "Diane Rotono", role: "Researcher" },
      { image: "/Vhon.jpg", name: "Vhon Nicole Gonzaga", role: "Researcher" },
      { image: "/Seth.jpg", name: "Seth Exequiel Balido", role: "Researcher" },
    ],
    [
      { image: "/Kring.jpg", name: "Krhyss Kringle Tuba-on", role: "Project Manager / UI Designer" },
    ]
  ];
  
  const TeamPage = () => (
    <div>
      {teamData.map((members, index) => (
        <TeamSection key={index} members={members} />
      ))}
    </div>
  );
  
  export default TeamPage;
  