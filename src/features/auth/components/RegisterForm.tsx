'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '@/shared/utils/validators';
import { useRegister } from '@/features/auth/hooks/useAuth';
import { extractApiError } from '@/shared/utils/api-error';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

export function RegisterForm() {
  const t = useTranslations();
  const { mutate: register_, isPending, isError, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const apiErrorMessage = isError ? extractApiError(error, t('auth.registerFailed')) : null;

  return (
    <form onSubmit={handleSubmit((values) => register_(values))} className="space-y-4" noValidate>
      <Input
        label={t('common.fields.fullName')}
        type="text"
        autoComplete="name"
        placeholder={t('auth.namePlaceholder')}
        error={errors.name?.message && t(errors.name.message)}
        {...register('name')}
      />
      <Input
        label={t('common.fields.email')}
        type="email"
        autoComplete="email"
        placeholder={t('common.placeholders.email')}
        error={errors.email?.message && t(errors.email.message)}
        {...register('email')}
      />
      <Input
        label={t('common.fields.password')}
        type="password"
        autoComplete="new-password"
        placeholder={t('common.placeholders.password')}
        hint={t('auth.passwordHint')}
        error={errors.password?.message && t(errors.password.message)}
        {...register('password')}
      />

      {isError && apiErrorMessage && (
        <p role="alert" className="text-danger text-sm">
          {apiErrorMessage}
        </p>
      )}

      <Button type="submit" className="w-full" loading={isPending}>
        {t('common.actions.createAccount')}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        {t('auth.haveAccount')}{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          {t('common.actions.signIn')}
        </Link>
      </p>
    </form>
  );
}
