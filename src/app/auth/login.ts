import { Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { toApiFailure } from '../api/envelope';
import { SessionStore } from '../session/session-store';

const REASONS: Record<string, string> = {
  SESSION_REPLACED: 'This account signed in somewhere else, so this session ended.',
  INVALID_REFRESH_TOKEN: 'Your session ended. Sign in again.',
  UNAUTHORIZED: 'Your session ended. Sign in again.',
  SIGNED_OUT: 'You were signed out.',
  SIGNED_OUT_ELSEWHERE: 'You signed out in another tab.',
};

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ButtonModule, InputText, Message],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  readonly returnUrl = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    identifier: ['', [Validators.required, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
  });
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = computed(() => {
    const reason = this.session.reason();
    return reason ? (REASONS[reason] ?? REASONS['SIGNED_OUT']) : null;
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    const { identifier, password } = this.form.getRawValue();
    try {
      await this.session.login(identifier.trim(), password);
      await this.router.navigateByUrl(this.returnUrl() || '/');
    } catch (error) {
      this.error.set(toApiFailure(error).message);
      this.form.controls.password.reset();
    } finally {
      this.submitting.set(false);
    }
  }
}
