import { getFieldError } from '../../util';

const cnpRegex = /^\d{13}$/;

const ProfileEditTab = ({
  form,
  handleSubmit,
  inputClassName,
  error,
  success,
  isPictureActionPending,
}) => {
  const Form = form;

  return (
    <section
      className="pt-6"
      role="tabpanel"
      id="profile-panel-edit"
      aria-labelledby="profile-tab-edit"
    >
      <h2 className="text-cusens-text-primary text-lg font-bold leading-tight tracking-tight mb-4">Edit Profile</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Field name="firstName">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClassName}
                  placeholder="First name"
                />
              </div>
            )}
          </Form.Field>

          <Form.Field name="lastName">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClassName}
                  placeholder="Last name"
                />
              </div>
            )}
          </Form.Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Field name="telefon">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="telefon">
                  Phone
                </label>
                <input
                  id="telefon"
                  name="telefon"
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClassName}
                  placeholder="Phone number"
                />
              </div>
            )}
          </Form.Field>

          <Form.Field name="dateOfBirth">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="dateOfBirth">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClassName}
                />
              </div>
            )}
          </Form.Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Field name="sex">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="sex">
                  Sex
                </label>
                <select
                  id="sex"
                  name="sex"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Not specified</option>
                  <option value="M">Male (M)</option>
                  <option value="F">Female (F)</option>
                  <option value="O">Other (O)</option>
                </select>
              </div>
            )}
          </Form.Field>

          <Form.Field
            name="cnp"
            validators={{
              onChange: ({ value }) => {
                const normalizedCnp = value.trim();
                if (normalizedCnp && !cnpRegex.test(normalizedCnp)) {
                  return 'CNP must contain exactly 13 digits.';
                }
                return undefined;
              },
              onSubmit: ({ value }) => {
                const normalizedCnp = value.trim();
                if (normalizedCnp && !cnpRegex.test(normalizedCnp)) {
                  return 'CNP must contain exactly 13 digits.';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="cnp">
                  CNP
                </label>
                <input
                  id="cnp"
                  name="cnp"
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClassName}
                  placeholder="13 digits"
                  maxLength={13}
                />
                {getFieldError(field.state.meta.errors) && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError(field.state.meta.errors)}</p>
                )}
              </div>
            )}
          </Form.Field>
        </div>

        <Form.Field name="address">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className={`${inputClassName} min-h-20`}
                placeholder="Address"
              />
            </div>
          )}
        </Form.Field>

        <Form.Field name="bio">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-cusens-text-primary mb-1.5" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className={`${inputClassName} min-h-24`}
                placeholder="Tell people a bit about yourself"
              />
            </div>
          )}
        </Form.Field>

        {error && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">{error}</div>}

        {success && (
          <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-xl text-sm">
            {success}
          </div>
        )}

        <Form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, canSubmit: state.canSubmit })}>
          {({ isSubmitting, canSubmit }) => (
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit || isPictureActionPending}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-cusens-text-primary bg-cusens-primary hover:bg-cusens-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cusens-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          )}
        </Form.Subscribe>
      </form>
    </section>
  );
};

export default ProfileEditTab;
