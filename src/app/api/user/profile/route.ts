import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-response";
import { ValidationError } from "@/lib/api-error";

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { firstName, lastName, age } = body;

    if (!firstName?.trim()) {
      throw new ValidationError("El nombre es obligatorio");
    }

    const name = `${firstName.trim()} ${lastName?.trim() || ""}`.trim();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { firstName: firstName.trim(), lastName: lastName?.trim() || null, age: age ? Number(age) : null, name },
    });

    return apiSuccess({ user: { id: user.id, name: user.name, firstName: user.firstName, lastName: user.lastName, age: user.age, email: user.email, image: user.image } });
  } catch (error) {
    return apiError(error);
  }
}
