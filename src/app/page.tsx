import { auth } from "@/auth";
import { Gate } from "@/components/gate/gate";

export default async function HomePage() {
  const session = await auth();
  return <Gate signedIn={Boolean(session?.user)} />;
}
