import { User } from "lucide-react";

interface TeamMemberProps {
  name: string;
  role: string;
}

const TeamMemberCard = ({ name, role }: TeamMemberProps) => {
  return (
    <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-primary" />
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;