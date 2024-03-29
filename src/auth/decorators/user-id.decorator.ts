import {createParamDecorator, ExecutionContext} from "@nestjs/common";

export const userIdDecorator = createParamDecorator(
    (_:unknown, ctx: ExecutionContext): string | null => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.id ? request.user.id : null;
    }
)