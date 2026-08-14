type ServiceWorkerRegistrationLike = {
  unregister: () => Promise<boolean>;
};

type ServiceWorkerContainerLike = {
  getRegistrations: () => Promise<readonly ServiceWorkerRegistrationLike[]>;
};

export function shouldRegisterServiceWorker(
  isDevelopment: boolean,
  isSupported: boolean
) {
  return !isDevelopment && isSupported;
}

export async function unregisterDevelopmentServiceWorkers(
  serviceWorker: ServiceWorkerContainerLike
) {
  const registrations = await serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}
