
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "./App.css";

// Get date 6 months from today
const sixMonthsFromToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() + 6);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Traveller validation schema
const travellerSchema = z.object({
  fullName: z.string().trim().refine(
    (name) => name.split(/\s+/).filter(Boolean).length >= 2,
    "Enter your first name and last name as shown on your passport"
  ),

  email: z.string().trim().email(
    "Enter a valid email address (e.g. name@example.com)"
  ),

  phone: z.string().regex(
    /^\d{10}$/,
    "Enter a valid 10-digit phone number"
  ),

  passportNumber: z.string().trim().min(
    5,
    "Enter a valid passport number"
  ),

  expiryDate: z.string().refine(
    (date) => date >= sixMonthsFromToday(),
    "Passport must be valid for at least 6 more months"
  ),
});

// Main form schema
const formSchema = z.object({
  travellers: z.array(travellerSchema)
    .min(1, "At least one traveller is required")
    .max(6, "Maximum 6 travellers allowed"),
}).superRefine((data, ctx) => {
  const passportNumbers = data.travellers.map((traveller) =>
    traveller.passportNumber.trim().toUpperCase()
  );

  passportNumbers.forEach((passport, index) => {
    if (passportNumbers.indexOf(passport) !== index) {
      ctx.addIssue({
        code: "custom",
        message: "Passport numbers must be unique",
        path: ["travellers", index, "passportNumber"],
      });
    }
  });
});

// Generate TypeScript type from Zod
type FormData = z.infer<typeof formSchema>;

function App() {
  const [submittedData, setSubmittedData] =
    useState<FormData | null>(null);

  // Controls when validation messages become visible
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),

    // Validate after the user leaves a field
    mode: "onTouched",

    // Revalidate while correcting an invalid field
    reValidateMode: "onChange",

    defaultValues: {
      travellers: [
        {
          fullName: "",
          email: "",
          phone: "",
          passportNumber: "",
          expiryDate: "",
        },
      ],
    },

    shouldFocusError: true,
  });

  // Manage dynamic traveller fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "travellers",
  });

  // Submit valid data
  const onSubmit = (data: FormData) => {
    setHasSubmitted(true);
    setSubmittedData(data);
  };

  // Handle invalid submission
  const onInvalid = () => {
    setHasSubmitted(true);
    setSubmittedData(null);
  };

  // Add traveller
  const addTraveller = () => {
    if (fields.length < 6) {
      append({
        fullName: "",
        email: "",
        phone: "",
        passportNumber: "",
        expiryDate: "",
      });

      // Keep the newly added traveller form clean
      setHasSubmitted(false);
      setSubmittedData(null);
    }
  };

  // Remove traveller
  const removeTraveller = (index: number) => {
    remove(index);
    setHasSubmitted(false);
    setSubmittedData(null);
  };

  return (
    <div className="container">

      <header className="page-header">
        <h1>Traveller Details</h1>
        <p>Enter the passport details of all travellers.</p>
      </header>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit, onInvalid)}
      >

        <div className="top-bar">
          <h2>Travellers ({fields.length}/6)</h2>

          <button
            type="button"
            className="add-btn"
            onClick={addTraveller}
            disabled={fields.length >= 6}
          >
            + Add Traveller
          </button>
        </div>

        {fields.map((field, index) => {
          const travellerErrors = errors.travellers?.[index];
          const touched = touchedFields.travellers?.[index];

          // Show errors only after blur or form submission
          const showNameError =
            !!travellerErrors?.fullName &&
            (!!touched?.fullName || hasSubmitted);

          const showEmailError =
            !!travellerErrors?.email &&
            (!!touched?.email || hasSubmitted);

          const showPhoneError =
            !!travellerErrors?.phone &&
            (!!touched?.phone || hasSubmitted);

          const showPassportError =
            !!travellerErrors?.passportNumber &&
            (!!touched?.passportNumber || hasSubmitted);

          const showExpiryError =
            !!travellerErrors?.expiryDate &&
            (!!touched?.expiryDate || hasSubmitted);

          return (
            <section className="traveller-card" key={field.id}>

              <div className="card-heading">
                <h3>Traveller {index + 1}</h3>

                {fields.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeTraveller(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Full Name */}
              <label htmlFor={`name-${index}`}>
                Full Name (as on passport)
              </label>

              <input
                id={`name-${index}`}
                type="text"
                placeholder="Enter first name and last name"
                {...register(`travellers.${index}.fullName`)}
                aria-invalid={showNameError}
                aria-describedby={`name-error-${index}`}
              />

              {showNameError && (
                <p className="error" id={`name-error-${index}`}>
                  {travellerErrors?.fullName?.message}
                </p>
              )}

              {/* Email */}
              <label htmlFor={`email-${index}`}>
                Email Address
              </label>

              <input
                id={`email-${index}`}
                type="email"
                placeholder="name@example.com"
                {...register(`travellers.${index}.email`)}
                aria-invalid={showEmailError}
                aria-describedby={`email-error-${index}`}
              />

              {showEmailError && (
                <p className="error" id={`email-error-${index}`}>
                  {travellerErrors?.email?.message}
                </p>
              )}

              {/* Phone */}
              <label htmlFor={`phone-${index}`}>
                Phone Number
              </label>

              <input
                id={`phone-${index}`}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10-digit phone number"
                {...register(`travellers.${index}.phone`)}
                aria-invalid={showPhoneError}
                aria-describedby={`phone-error-${index}`}
              />

              {showPhoneError && (
                <p className="error" id={`phone-error-${index}`}>
                  {travellerErrors?.phone?.message}
                </p>
              )}

              {/* Passport Number */}
              <label htmlFor={`passport-${index}`}>
                Passport Number
              </label>

              <input
                id={`passport-${index}`}
                type="text"
                placeholder="Enter passport number"
                {...register(`travellers.${index}.passportNumber`)}
                aria-invalid={showPassportError}
                aria-describedby={`passport-error-${index}`}
              />

              {showPassportError && (
                <p className="error" id={`passport-error-${index}`}>
                  {travellerErrors?.passportNumber?.message}
                </p>
              )}

              {/* Passport Expiry */}
              <label htmlFor={`expiry-${index}`}>
                Passport Expiry Date
              </label>

              <input
                id={`expiry-${index}`}
                type="date"
                min={sixMonthsFromToday()}
                {...register(`travellers.${index}.expiryDate`)}
                aria-invalid={showExpiryError}
                aria-describedby={`expiry-error-${index}`}
              />

              {showExpiryError && (
                <p className="error" id={`expiry-error-${index}`}>
                  {travellerErrors?.expiryDate?.message}
                </p>
              )}

            </section>
          );
        })}

        <button type="submit" className="submit-btn">
          Submit Traveller Details
        </button>

      </form>

      {/* Submitted Data Summary */}
      {submittedData && (
        <div className="summary" aria-live="polite">
          <h2>Submitted Successfully!</h2>
          <h3>Traveller Summary</h3>

          {submittedData.travellers.map((traveller, index) => (
            <div className="summary-card" key={index}>
              <h4>Traveller {index + 1}</h4>

              <p><strong>Name:</strong> {traveller.fullName}</p>
              <p><strong>Email:</strong> {traveller.email}</p>
              <p><strong>Phone:</strong> {traveller.phone}</p>
              <p><strong>Passport:</strong> {traveller.passportNumber}</p>
              <p><strong>Expiry:</strong> {traveller.expiryDate}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default App;
