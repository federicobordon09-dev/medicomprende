import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { firstName, lastName, age } = body;

  if (!firstName?.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const name = `${firstName.trim()} ${lastName?.trim() || ""}`.trim();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { firstName: firstName.trim(), lastName: lastName?.trim() || null, age: age ? Number(age) : null, name },
  });

  return NextResponse.json({ user: { id: user.id, name: user.name, firstName: user.firstName, lastName: user.lastName, age: user.age, email: user.email, image: user.image } });
}
