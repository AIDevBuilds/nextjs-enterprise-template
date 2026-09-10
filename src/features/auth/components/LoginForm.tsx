'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/shared/utils/validators';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { extractApiError } from '@/shared/utils/api-error';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

export function LoginForm() {
  const t = useTranslations();
  const { mutate: login, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const apiErrorMessage = isError ? extractApiError(error, t('auth.loginFailed')) : null;

  return (
    <form onSubmit={handleSubmit((values) => login(values))} className="space-y-4" noValidate>
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
        autoComplete="current-password"
        placeholder={t('common.placeholders.password')}
        error={errors.password?.message && t(errors.password.message)}
        {...register('password')}
      />

      {isError && apiErrorMessage && (
        <p role="alert" className="text-sm text-danger">
          {apiErrorMessage}
        </p>
      )}

      <Button type="submit" className="w-full" loading={isPending}>
        {t('common.actions.signIn')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t('common.actions.signUp')}
        </Link>
      </p>
    </form>
  );
}
