
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "./App.css";

// Calculate the minimum passport expiry date (6 months ahead)
const sixMonthsFromToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() + 6);
  return date.toISOString().split("T")[0];
};

// Zod validation schema
const travellerSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().regex(/^\d{10}$/, "Enter a 10-digit phone number"),
  passportNumber: z.string().trim().min(5, "Enter a valid passport number"),
  expiryDate: z.string().refine(
    (date) => date >= sixMonthsFromToday(),
    "Passport must be valid for at least 6 more months"
  ),
});

const formSchema = z.object({
  travellers: z.array(travellerSchema)
    .min(1, "At least one traveller is required")
    .max(6, "Maximum 6 travellers allowed"),
}).superRefine((data, ctx) => {
  const passportNumbers = data.travellers.map(
    (traveller) => traveller.passportNumber.trim().toUpperCase()
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

type FormData = z.infer<typeof formSchema>;

function App() {
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "travellers",
  });

  const onSubmit = (data: FormData) => {
    setSubmittedData(data);
  };

  const addTraveller = () => {
    if (fields.length < 6) {
      append({
        fullName: "",
        email: "",
        phone: "",
        passportNumber: "",
        expiryDate: "",
      });
    }
  };

  return (
    <div className="container">
      <h1>Traveller Details</h1>
      <p className="subtitle">
        Enter the passport details of all travellers.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="top-bar">
          <h2>Travellers ({fields.length}/6)</h2>
          <button
            type="button"
            onClick={addTraveller}
            disabled={fields.length >= 6}
          >
            + Add Traveller
          </button>
        </div>

        {fields.map((field, index) => {
          const travellerErrors = errors.travellers?.[index];

          return (
            <section className="traveller-card" key={field.id}>
              <div className="card-heading">
                <h3>Traveller {index + 1}</h3>

                {fields.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <label htmlFor={`name-${index}`}>Full Name</label>
              <input
                id={`name-${index}`}
                {...register(`travellers.${index}.fullName`)}
                placeholder="Name as on passport"
                aria-invalid={!!travellerErrors?.fullName}
                aria-describedby={`name-error-${index}`}
              />
              {travellerErrors?.fullName && (
                <p className="error" id={`name-error-${index}`}>
                  {travellerErrors.fullName.message}
                </p>
              )}

              <label htmlFor={`email-${index}`}>Email</label>
              <input
                id={`email-${index}`}
                type="email"
                {...register(`travellers.${index}.email`)}
                placeholder="example@email.com"
                aria-invalid={!!travellerErrors?.email}
                aria-describedby={`email-error-${index}`}
              />
              {travellerErrors?.email && (
                <p className="error" id={`email-error-${index}`}>
                  {travellerErrors.email.message}
                </p>
              )}

              <label htmlFor={`phone-${index}`}>Phone Number</label>
              <input
                id={`phone-${index}`}
                {...register(`travellers.${index}.phone`)}
                placeholder="10-digit phone number"
                maxLength={10}
                aria-invalid={!!travellerErrors?.phone}
                aria-describedby={`phone-error-${index}`}
              />
              {travellerErrors?.phone && (
                <p className="error" id={`phone-error-${index}`}>
                  {travellerErrors.phone.message}
                </p>
              )}

              <label htmlFor={`passport-${index}`}>Passport Number</label>
              <input
                id={`passport-${index}`}
                {...register(`travellers.${index}.passportNumber`)}
                placeholder="Enter passport number"
                aria-invalid={!!travellerErrors?.passportNumber}
                aria-describedby={`passport-error-${index}`}
              />
              {travellerErrors?.passportNumber && (
                <p className="error" id={`passport-error-${index}`}>
                  {travellerErrors.passportNumber.message}
                </p>
              )}

              <label htmlFor={`expiry-${index}`}>Passport Expiry Date</label>
              <input
                id={`expiry-${index}`}
                type="date"
                min={sixMonthsFromToday()}
                {...register(`travellers.${index}.expiryDate`)}
                aria-invalid={!!travellerErrors?.expiryDate}
                aria-describedby={`expiry-error-${index}`}
              />
              {travellerErrors?.expiryDate && (
                <p className="error" id={`expiry-error-${index}`}>
                  {travellerErrors.expiryDate.message}
                </p>
              )}
            </section>
          );
        })}

        <button type="submit" className="submit-btn">
          Submit Traveller Details
        </button>
      </form>

      {submittedData && (
        <div className="summary">
          <h2>Submitted Successfully!</h2>
          <h3>Traveller Summary</h3>
          {submittedData.travellers.map((traveller, index) => (
            <div key={index} className="summary-card">
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
