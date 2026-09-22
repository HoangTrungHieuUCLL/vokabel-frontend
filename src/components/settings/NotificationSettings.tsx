import { useCallback, useEffect, useState } from 'react'
import * as api from '../../api/client'
import type { NotificationStatus, NotifySettings } from '../../api/types'
import { useI18n } from '../../i18n/I18nContext'
import {
  PermissionDeniedError,
  createSubscription,
  getExistingSubscription,
  probeSupport,
  type PushSupport,
} from '../../lib/push'
import { NotifyTimesEditor } from './NotifyTimesEditor'
import { BellIcon, BellOffIcon } from '../icons'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

type Busy = 'idle' | 'enabling' | 'disabling' | 'testing'

export function NotificationSettings() {
  const { t } = useI18n()
  // Probed once during the first render: both reads are synchronous browser
  // state, not something to synchronise in an effect.
  const [support] = useState<PushSupport>(probeSupport)
  const [status, setStatus] = useState<NotificationStatus | null>(null)
  const [times, setTimes] = useState<NotifySettings | null>(null)
  const [busy, setBusy] = useState<Busy>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [blocked, setBlocked] = useState(
    () => typeof Notification !== 'undefined' && Notification.permission === 'denied',
  )

  const refresh = useCallback(async () => {
    const existing = await getExistingSubscription().catch(() => null)
    try {
      setStatus(await api.getNotificationStatus(existing?.endpoint))
    } catch {
      setStatus(null)
    }
    try {
      setTimes(await api.getNotifySettings())
    } catch {
      setTimes(null)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const enable = async () => {
    setBusy('enabling')
    setMessage(null)
    try {
      const { public_key, push_enabled } = await api.getVapidKey()
      if (!push_enabled || !public_key) {
        setMessage(t('notify.serverDisabled'))
        return
      }
      const subscription = await createSubscription(public_key)
      setStatus(await api.subscribePush(subscription.toJSON(), navigator.userAgent))
    } catch (err) {
      if (err instanceof PermissionDeniedError) {
        setBlocked(true)
        setMessage(t('notify.blocked'))
      } else {
        setMessage(t('notify.failed'))
      }
    } finally {
      setBusy('idle')
    }
  }

  const disable = async () => {
    setBusy('disabling')
    setMessage(null)
    try {
      const existing = await getExistingSubscription()
      if (existing) {
        // Tell the server first: if unsubscribing locally succeeded but the
        // call failed, the server would keep pushing to a dead endpoint until
        // the push service reported it gone.
        await api.unsubscribePush(existing.endpoint)
        await existing.unsubscribe()
      }
      await refresh()
    } catch {
      setMessage(t('notify.failed'))
    } finally {
      setBusy('idle')
    }
  }

  const sendTest = async () => {
    setBusy('testing')
    setMessage(null)
    try {
      const result = await api.sendTestNotification()
      setMessage(result.sent > 0 ? t('notify.testSent') : t('notify.testNoDevices'))
    } catch {
      setMessage(t('notify.failed'))
    } finally {
      setBusy('idle')
    }
  }

  const subscribed = status?.subscribed ?? false
  const otherDevices = (status?.subscription_count ?? 0) - (subscribed ? 1 : 0)

  return (
    <Card className="flex flex-col gap-3">
      <p className="eyebrow text-[12px]">{t('notify.title')}</p>
      <p className="text-[13px] text-ink-secondary">{t('notify.description')}</p>

      {times && (
        <NotifyTimesEditor
          settings={times}
          onSaved={(next) => {
            setTimes(next)
            // The status card also prints the times and the next one due.
            void refresh()
          }}
        />
      )}

      {support === 'needs-install' ? (
        <p className="rounded-[var(--radius-control)] bg-highlight-soft px-3 py-2 text-[13px] text-ink-secondary">
          {t('notify.iosInstall')}
        </p>
      ) : support === 'unsupported' ? (
        <p className="text-[13px] text-ink-tertiary">{t('notify.unsupported')}</p>
      ) : blocked && !subscribed ? (
        <p className="text-[13px] text-negative">{t('notify.blocked')}</p>
      ) : subscribed ? (
        <>
          <p className="flex items-center gap-2 text-[13px] text-ink">
            <BellIcon className="h-4 w-4 text-accent" />
            {t('notify.enabled')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={sendTest} disabled={busy !== 'idle'}>
              {busy === 'testing' ? t('notify.working') : t('notify.test')}
            </Button>
            <Button variant="ghost" size="sm" onClick={disable} disabled={busy !== 'idle'}>
              <BellOffIcon className="h-4 w-4" />
              {busy === 'disabling' ? t('notify.working') : t('notify.disable')}
            </Button>
          </div>
        </>
      ) : (
        <Button onClick={enable} disabled={busy !== 'idle'}>
          <BellIcon className="h-4 w-4" />
          {busy === 'enabling' ? t('notify.working') : t('notify.enable')}
        </Button>
      )}

      {otherDevices > 0 && (
        <p className="text-[12px] text-ink-tertiary">
          {otherDevices} {otherDevices === 1 ? t('notify.otherDevice') : t('notify.otherDevices')}
        </p>
      )}

      {message && <p className="text-[13px] text-ink-secondary">{message}</p>}
    </Card>
  )
}
