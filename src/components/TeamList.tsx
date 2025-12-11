import TeamMemberCard from "./TeamMembers";

const teamMembers = [
  { name: "Priyanshu Ranjan", role: "Web Content and Integration" },
  { name: "Harsh Gupta", role: "ML Developer" },
  { name: "Anvesha Rastogi", role: "ML Developer" },
  { name: "Shrish", role: "Frontend and UI Designer" },
  { name: "Parth Deshpande", role: "Frontend and UI Support" },
];

const TeamList = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {teamMembers.map((member) => (
        <TeamMemberCard
          key={member.name}
          name={member.name}
          role={member.role}
        />
      ))}
    </div>
  );
};

export default TeamList;