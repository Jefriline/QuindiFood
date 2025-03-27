# Conversación QuindiFood - Desarrollo Backend

## Instrucciones para guardar conversaciones futuras

1. Selecciona toda la conversación (Ctrl + A)
2. Copia todo el contenido (Ctrl + C)
3. Crea un nuevo archivo markdown
4. Pega el contenido

## Estructura del proyecto documentada

- `controllers/UserController/`
  - `registerUser.ts`
  - `loginUser.ts`
  - `userProfile.ts`
- `services/UserServices/`
  - `userService.ts`
- `repositories/UserRepository/`
  - `userRepository.ts`
- `middleware/UserValidator/`
  - `userRegisterMiddleware.ts`
  - `userAuthMiddleware.ts`
  - `userProfileMiddleware.ts`
- `Dto/UserDto/`
  - `registerUserDto.ts`
  - `loginUserDto.ts`
  - `userProfileDto.ts`

## Notas importantes
- Las fechas se guardan en zona horaria America/Bogota
- Los passwords se hashean con bcrypt
- Por defecto los usuarios se registran como CLIENTE 