import { sendMail } from "../../src/helpers/mail-helper";
import transporter from "../../src/config/transporter";
import config from "../../src/config/index";

jest.mock("../../src/config/transporter");
jest.mock("../../src/config/index");

describe("sendMail", () => {
  it("should call transporter.sendMail with correct arguments", async () => {
    const mockMailOptions = {
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Text",
      html: "<p>Test HTML</p>",
    };

    config.AWS_SES_SENDER_EMAIL = "sender@example.com";

    await sendMail(mockMailOptions);

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: "sender@example.com",
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Text",
      html: "<p>Test HTML</p>",
    });
  });

  it("should throw an error if transporter.sendMail fails", async () => {
    const mockMailOptions = {
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Text",
      html: "<p>Test HTML</p>",
    };

    config.AWS_SES_SENDER_EMAIL = "sender@example.com";
    jest
      .spyOn(transporter, "sendMail")
      .mockRejectedValue(new Error("Test Error"));

    await expect(sendMail(mockMailOptions)).rejects.toThrow(
      "Failed to send email."
    );
  });
});
