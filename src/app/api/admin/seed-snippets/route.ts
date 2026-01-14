import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";

const snippets = [
  // MOTOR CONTROL - Java
  {
    title: "Basic PWM Motor Control",
    description: "Simple PWM motor controller initialization and control",
    code: `import edu.wpi.first.wpilibj.motorcontrol.PWMSparkMax;

public class Robot extends TimedRobot {
    private PWMSparkMax motor;
    
    @Override
    public void robotInit() {
        motor = new PWMSparkMax(0); // PWM port 0
    }
    
    @Override
    public void teleopPeriodic() {
        // Set motor speed from -1.0 to 1.0
        motor.set(0.5);
    }
}`,
    language: "java",
    category: "motor",
    tags: ["pwm", "basic", "motor-control"]
  },
  {
    title: "Differential Drive (Tank Drive)",
    description: "Tank drive implementation with two motor groups",
    code: `import edu.wpi.first.wpilibj.motorcontrol.MotorControllerGroup;
import edu.wpi.first.wpilibj.motorcontrol.PWMSparkMax;
import edu.wpi.first.wpilibj.drive.DifferentialDrive;
import edu.wpi.first.wpilibj.XboxController;

public class DriveSubsystem {
    private final PWMSparkMax leftFront = new PWMSparkMax(0);
    private final PWMSparkMax leftRear = new PWMSparkMax(1);
    private final PWMSparkMax rightFront = new PWMSparkMax(2);
    private final PWMSparkMax rightRear = new PWMSparkMax(3);
    
    private final MotorControllerGroup leftMotors = 
        new MotorControllerGroup(leftFront, leftRear);
    private final MotorControllerGroup rightMotors = 
        new MotorControllerGroup(rightFront, rightRear);
    
    private final DifferentialDrive drive = 
        new DifferentialDrive(leftMotors, rightMotors);
    
    public void tankDrive(double leftSpeed, double rightSpeed) {
        drive.tankDrive(leftSpeed, rightSpeed);
    }
    
    public void arcadeDrive(double speed, double rotation) {
        drive.arcadeDrive(speed, rotation);
    }
}`,
    language: "java",
    category: "motor",
    tags: ["differential-drive", "tank-drive", "arcade-drive"]
  },
  {
    title: "Arcade Drive with Xbox Controller",
    description: "Arcade drive controlled by Xbox controller",
    code: `import edu.wpi.first.wpilibj.XboxController;
import edu.wpi.first.wpilibj.drive.DifferentialDrive;

public class Robot extends TimedRobot {
    private DifferentialDrive drive;
    private XboxController controller;
    
    @Override
    public void robotInit() {
        drive = new DifferentialDrive(leftMotors, rightMotors);
        controller = new XboxController(0);
    }
    
    @Override
    public void teleopPeriodic() {
        drive.arcadeDrive(
            -controller.getLeftY(),
            -controller.getRightX()
        );
    }
}`,
    language: "java",
    category: "motor",
    tags: ["arcade-drive", "xbox-controller", "teleop"]
  },
  {
    title: "Encoder Setup and Reading",
    description: "Setup and read values from a quadrature encoder",
    code: `import edu.wpi.first.wpilibj.Encoder;

public class Robot extends TimedRobot {
    private Encoder encoder;
    
    @Override
    public void robotInit() {
        encoder = new Encoder(0, 1);
        encoder.setDistancePerPulse(Math.PI * 6.0 / 2048.0);
        encoder.reset();
    }
    
    @Override
    public void teleopPeriodic() {
        double distance = encoder.getDistance();
        double rate = encoder.getRate();
        int count = encoder.get();
        
        SmartDashboard.putNumber("Distance", distance);
        SmartDashboard.putNumber("Velocity", rate);
    }
}`,
    language: "java",
    category: "sensor",
    tags: ["encoder", "distance", "velocity"]
  },
  {
    title: "Gyroscope (ADXRS450)",
    description: "Using the ADXRS450 gyroscope for robot orientation",
    code: `import edu.wpi.first.wpilibj.ADXRS450_Gyro;
import edu.wpi.first.wpilibj.SPI;

public class DriveSubsystem {
    private final ADXRS450_Gyro gyro = new ADXRS450_Gyro(SPI.Port.kOnboardCS0);
    
    public void calibrateGyro() {
        gyro.calibrate();
    }
    
    public double getAngle() {
        return gyro.getAngle();
    }
    
    public double getRate() {
        return gyro.getRate();
    }
}`,
    language: "java",
    category: "sensor",
    tags: ["gyro", "orientation", "rotation"]
  },
  {
    title: "Single Solenoid Control",
    description: "Control a single solenoid pneumatic cylinder",
    code: `import edu.wpi.first.wpilibj.PneumaticsModuleType;
import edu.wpi.first.wpilibj.Solenoid;

public class IntakeSubsystem {
    private final Solenoid intakeSolenoid = 
        new Solenoid(PneumaticsModuleType.CTREPCM, 0);
    
    public void extendIntake() {
        intakeSolenoid.set(true);
    }
    
    public void retractIntake() {
        intakeSolenoid.set(false);
    }
}`,
    language: "java",
    category: "pneumatics",
    tags: ["solenoid", "pneumatics", "cylinder"]
  },
  {
    title: "Basic PID Controller",
    description: "PID controller for position control",
    code: `import edu.wpi.first.math.controller.PIDController;

public class ElevatorSubsystem extends SubsystemBase {
    private final PWMSparkMax motor = new PWMSparkMax(0);
    private final Encoder encoder = new Encoder(0, 1);
    private final PIDController pidController = new PIDController(0.5, 0.0, 0.0);
    
    private double targetPosition = 0;
    
    public void setTargetPosition(double position) {
        targetPosition = position;
    }
    
    @Override
    public void periodic() {
        double currentPosition = encoder.getDistance();
        double output = pidController.calculate(currentPosition, targetPosition);
        motor.set(output);
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["pid", "control", "position"]
  },
  {
    title: "Tank Drive (Python)",
    description: "Tank drive implementation in Python",
    code: `import wpilib
import wpilib.drive

class MyRobot(wpilib.TimedRobot):
    def robotInit(self):
        self.left_motor = wpilib.PWMSparkMax(0)
        self.right_motor = wpilib.PWMSparkMax(1)
        
        self.drive = wpilib.drive.DifferentialDrive(
            self.left_motor, 
            self.right_motor
        )
        
        self.controller = wpilib.XboxController(0)
    
    def teleopPeriodic(self):
        self.drive.tankDrive(
            -self.controller.getLeftY(),
            -self.controller.getRightY()
        )`,
    language: "python",
    category: "motor",
    tags: ["tank-drive", "python", "basic"]
  }
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    let created = 0;
    let skipped = 0;

    for (const snippet of snippets) {
      // Check if snippet already exists
      const existing = await prisma.codeSnippet.findFirst({
        where: {
          title: snippet.title,
          userId: session.user.id
        }
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.codeSnippet.create({
        data: {
          ...snippet,
          userId: session.user.id,
          isPublic: true,
          viewCount: 0,
          favoriteCount: 0
        }
      });

      created++;
    }

    return NextResponse.json({
      success: true,
      message: `Snippet seeding complete! Created: ${created}, Skipped: ${skipped}`,
      created,
      skipped
    });

  } catch (error) {
    console.error("Error seeding snippets:", error);
    return NextResponse.json(
      { error: "Failed to seed snippets" },
      { status: 500 }
    );
  }
}

