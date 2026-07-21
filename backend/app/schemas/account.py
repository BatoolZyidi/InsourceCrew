from pydantic import BaseModel, EmailStr, Field, model_validator


class AccountUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=160)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=40)
    avatar_url: str | None = Field(default=None, max_length=512)


class PasswordChange(BaseModel):
    new_password: str = Field(min_length=12, max_length=128)
    confirm_password: str

    @model_validator(mode="after")
    def matches(self):
        if self.new_password != self.confirm_password:
            raise ValueError("New password confirmation does not match")
        return self


class DeleteAccountRequest(BaseModel):
    confirmation: str
