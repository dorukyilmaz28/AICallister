const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        // Initialize drive and controller
        drive = new DifferentialDrive(leftMotors, rightMotors);
        controller = new XboxController(0);
    }
    
    @Override
    public void teleopPeriodic() {
        // Left stick Y for forward/backward
        // Right stick X for rotation
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

  // SENSORS - Java
  {
    title: "Encoder Setup and Reading",
    description: "Setup and read values from a quadrature encoder",
    code: `import edu.wpi.first.wpilibj.Encoder;

public class Robot extends TimedRobot {
    private Encoder encoder;
    
    @Override
    public void robotInit() {
        // Encoder on DIO ports 0 and 1
        encoder = new Encoder(0, 1);
        
        // Set distance per pulse (wheel circumference / pulses per revolution)
        encoder.setDistancePerPulse(Math.PI * 6.0 / 2048.0);
        
        // Reset encoder
        encoder.reset();
    }
    
    @Override
    public void teleopPeriodic() {
        double distance = encoder.getDistance();
        double rate = encoder.getRate(); // velocity
        int count = encoder.get(); // raw count
        
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
    
    public void resetGyro() {
        gyro.reset();
    }
    
    public double getAngle() {
        // Returns cumulative angle in degrees
        return gyro.getAngle();
    }
    
    public double getRate() {
        // Returns rate of rotation in degrees per second
        return gyro.getRate();
    }
    
    public Rotation2d getRotation2d() {
        return gyro.getRotation2d();
    }
}`,
    language: "java",
    category: "sensor",
    tags: ["gyro", "orientation", "rotation"]
  },
  {
    title: "Limit Switch",
    description: "Using digital input as a limit switch",
    code: `import edu.wpi.first.wpilibj.DigitalInput;

public class ElevatorSubsystem {
    private final DigitalInput lowerLimit = new DigitalInput(0);
    private final DigitalInput upperLimit = new DigitalInput(1);
    
    public boolean isAtLowerLimit() {
        // Limit switches are typically normally-open (NO)
        // Returns true when pressed (closed)
        return !lowerLimit.get();
    }
    
    public boolean isAtUpperLimit() {
        return !upperLimit.get();
    }
    
    public void moveElevator(double speed) {
        // Stop if at limits
        if (speed < 0 && isAtLowerLimit()) {
            speed = 0;
        } else if (speed > 0 && isAtUpperLimit()) {
            speed = 0;
        }
        
        elevatorMotor.set(speed);
    }
}`,
    language: "java",
    category: "sensor",
    tags: ["limit-switch", "digital-input", "safety"]
  },

  // PNEUMATICS - Java
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
    
    public void toggleIntake() {
        intakeSolenoid.toggle();
    }
    
    public boolean isExtended() {
        return intakeSolenoid.get();
    }
}`,
    language: "java",
    category: "pneumatics",
    tags: ["solenoid", "pneumatics", "cylinder"]
  },
  {
    title: "Double Solenoid Control",
    description: "Control a double solenoid pneumatic cylinder",
    code: `import edu.wpi.first.wpilibj.DoubleSolenoid;
import edu.wpi.first.wpilibj.PneumaticsModuleType;
import static edu.wpi.first.wpilibj.DoubleSolenoid.Value.*;

public class ClawSubsystem {
    private final DoubleSolenoid clawSolenoid = 
        new DoubleSolenoid(
            PneumaticsModuleType.CTREPCM, 
            0, // forward channel
            1  // reverse channel
        );
    
    public void openClaw() {
        clawSolenoid.set(kForward);
    }
    
    public void closeClaw() {
        clawSolenoid.set(kReverse);
    }
    
    public void stopClaw() {
        clawSolenoid.set(kOff);
    }
    
    public boolean isOpen() {
        return clawSolenoid.get() == kForward;
    }
}`,
    language: "java",
    category: "pneumatics",
    tags: ["double-solenoid", "pneumatics", "claw"]
  },
  {
    title: "Compressor Control",
    description: "Automatic compressor control with pressure switch",
    code: `import edu.wpi.first.wpilibj.Compressor;
import edu.wpi.first.wpilibj.PneumaticsModuleType;

public class Robot extends TimedRobot {
    private final Compressor compressor = 
        new Compressor(PneumaticsModuleType.CTREPCM);
    
    @Override
    public void robotInit() {
        // Enable closed loop control (automatic)
        compressor.enableDigital();
        
        // Or disable for testing
        // compressor.disable();
    }
    
    @Override
    public void robotPeriodic() {
        // Monitor compressor status
        boolean isRunning = compressor.isEnabled();
        double current = compressor.getCurrent();
        boolean pressureSwitch = compressor.getPressureSwitchValue();
        
        SmartDashboard.putBoolean("Compressor Running", isRunning);
        SmartDashboard.putNumber("Compressor Current", current);
        SmartDashboard.putBoolean("Pressure Switch", pressureSwitch);
    }
}`,
    language: "java",
    category: "pneumatics",
    tags: ["compressor", "pressure", "automatic"]
  },

  // AUTONOMOUS - Java
  {
    title: "Simple Timed Autonomous",
    description: "Time-based autonomous routine",
    code: `import edu.wpi.first.wpilibj.Timer;

public class Robot extends TimedRobot {
    private final Timer autoTimer = new Timer();
    private DifferentialDrive drive;
    
    @Override
    public void autonomousInit() {
        autoTimer.reset();
        autoTimer.start();
    }
    
    @Override
    public void autonomousPeriodic() {
        double time = autoTimer.get();
        
        if (time < 2.0) {
            // Drive forward for 2 seconds
            drive.arcadeDrive(0.5, 0);
        } else if (time < 3.0) {
            // Turn for 1 second
            drive.arcadeDrive(0, 0.5);
        } else {
            // Stop
            drive.arcadeDrive(0, 0);
        }
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["timer", "auto", "basic"]
  },
  {
    title: "Distance-Based Autonomous",
    description: "Autonomous using encoder distance",
    code: `import edu.wpi.first.wpilibj.Encoder;

public class Robot extends TimedRobot {
    private Encoder leftEncoder;
    private Encoder rightEncoder;
    private DifferentialDrive drive;
    private int autoState = 0;
    
    @Override
    public void autonomousInit() {
        leftEncoder.reset();
        rightEncoder.reset();
        autoState = 0;
    }
    
    @Override
    public void autonomousPeriodic() {
        double distance = (leftEncoder.getDistance() + 
                          rightEncoder.getDistance()) / 2.0;
        
        switch(autoState) {
            case 0: // Drive forward 3 meters
                if (distance < 3.0) {
                    drive.arcadeDrive(0.6, 0);
                } else {
                    leftEncoder.reset();
                    rightEncoder.reset();
                    autoState = 1;
                }
                break;
                
            case 1: // Stop
                drive.arcadeDrive(0, 0);
                break;
        }
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["encoder", "distance", "state-machine"]
  },

  // COMMAND-BASED - Java
  {
    title: "Basic Command",
    description: "Simple command structure",
    code: `import edu.wpi.first.wpilibj2.command.Command;

public class DriveForwardCommand extends Command {
    private final DriveSubsystem driveSubsystem;
    private final double speed;
    
    public DriveForwardCommand(DriveSubsystem subsystem, double speed) {
        this.driveSubsystem = subsystem;
        this.speed = speed;
        addRequirements(subsystem);
    }
    
    @Override
    public void initialize() {
        System.out.println("DriveForwardCommand started");
    }
    
    @Override
    public void execute() {
        driveSubsystem.arcadeDrive(speed, 0);
    }
    
    @Override
    public void end(boolean interrupted) {
        driveSubsystem.arcadeDrive(0, 0);
        System.out.println("DriveForwardCommand ended");
    }
    
    @Override
    public boolean isFinished() {
        return false; // Runs until interrupted
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["command-based", "command", "subsystem"]
  },
  {
    title: "Subsystem Template",
    description: "Basic subsystem structure",
    code: `import edu.wpi.first.wpilibj2.command.SubsystemBase;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;

public class ExampleSubsystem extends SubsystemBase {
    // Hardware declarations
    private final PWMSparkMax motor = new PWMSparkMax(0);
    private final Encoder encoder = new Encoder(0, 1);
    
    public ExampleSubsystem() {
        // Configure hardware
        encoder.setDistancePerPulse(0.1);
    }
    
    // Subsystem methods
    public void setSpeed(double speed) {
        motor.set(speed);
    }
    
    public double getDistance() {
        return encoder.getDistance();
    }
    
    public void reset() {
        encoder.reset();
    }
    
    @Override
    public void periodic() {
        // This method runs every 20ms
        SmartDashboard.putNumber("Distance", getDistance());
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["subsystem", "command-based", "template"]
  },

  // PID CONTROL - Java
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
        
        SmartDashboard.putNumber("Elevator Position", currentPosition);
        SmartDashboard.putNumber("Elevator Target", targetPosition);
        SmartDashboard.putNumber("Elevator Error", 
            pidController.getPositionError());
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["pid", "control", "position"]
  },
  {
    title: "Flywheel Velocity PID",
    description: "PID controller for flywheel velocity control",
    code: `import edu.wpi.first.math.controller.PIDController;
import edu.wpi.first.math.controller.SimpleMotorFeedforward;

public class ShooterSubsystem extends SubsystemBase {
    private final PWMSparkMax shooterMotor = new PWMSparkMax(0);
    private final Encoder encoder = new Encoder(0, 1);
    
    // PID constants
    private final PIDController pidController = new PIDController(0.1, 0.0, 0.0);
    
    // Feedforward constants (from SysId)
    private final SimpleMotorFeedforward feedforward = 
        new SimpleMotorFeedforward(0.5, 0.12, 0.01);
    
    private double targetVelocity = 0;
    
    public void setTargetVelocity(double velocity) {
        targetVelocity = velocity;
    }
    
    @Override
    public void periodic() {
        double currentVelocity = encoder.getRate();
        
        // Calculate PID output
        double pidOutput = pidController.calculate(currentVelocity, targetVelocity);
        
        // Calculate feedforward
        double ffOutput = feedforward.calculate(targetVelocity);
        
        // Combine outputs
        shooterMotor.setVoltage(pidOutput + ffOutput);
        
        SmartDashboard.putNumber("Shooter Velocity", currentVelocity);
        SmartDashboard.putNumber("Shooter Target", targetVelocity);
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["pid", "feedforward", "velocity", "flywheel"]
  },

  // SWERVE DRIVE - Java
  {
    title: "Swerve Module (Basic)",
    description: "Basic swerve module implementation",
    code: `import edu.wpi.first.math.controller.PIDController;
import edu.wpi.first.math.geometry.Rotation2d;
import edu.wpi.first.math.kinematics.SwerveModuleState;

public class SwerveModule {
    private final PWMSparkMax driveMotor;
    private final PWMSparkMax turningMotor;
    private final Encoder driveEncoder;
    private final Encoder turningEncoder;
    private final PIDController turningPID;
    
    public SwerveModule(int drivePort, int turningPort, 
                       int driveEncoderA, int driveEncoderB,
                       int turningEncoderA, int turningEncoderB) {
        driveMotor = new PWMSparkMax(drivePort);
        turningMotor = new PWMSparkMax(turningPort);
        
        driveEncoder = new Encoder(driveEncoderA, driveEncoderB);
        turningEncoder = new Encoder(turningEncoderA, turningEncoderB);
        
        turningPID = new PIDController(1.0, 0, 0);
        turningPID.enableContinuousInput(-Math.PI, Math.PI);
    }
    
    public void setDesiredState(SwerveModuleState desiredState) {
        // Optimize the reference state to avoid spinning further than 90 degrees
        SwerveModuleState state = 
            SwerveModuleState.optimize(desiredState, getState().angle);
        
        // Set drive motor speed
        driveMotor.set(state.speedMetersPerSecond / 4.0); // 4.0 m/s max
        
        // Set turning motor with PID
        double turnOutput = turningPID.calculate(
            turningEncoder.getDistance(), 
            state.angle.getRadians()
        );
        turningMotor.set(turnOutput);
    }
    
    public SwerveModuleState getState() {
        return new SwerveModuleState(
            driveEncoder.getRate(),
            new Rotation2d(turningEncoder.getDistance())
        );
    }
}`,
    language: "java",
    category: "motor",
    tags: ["swerve", "advanced", "kinematics"]
  },

  // VISION - Java
  {
    title: "PhotonVision AprilTag Detection",
    description: "Detect AprilTags using PhotonVision",
    code: `import org.photonvision.PhotonCamera;
import org.photonvision.targeting.PhotonPipelineResult;
import org.photonvision.targeting.PhotonTrackedTarget;

public class VisionSubsystem extends SubsystemBase {
    private final PhotonCamera camera = new PhotonCamera("photonvision");
    
    public PhotonPipelineResult getLatestResult() {
        return camera.getLatestResult();
    }
    
    public boolean hasTargets() {
        return getLatestResult().hasTargets();
    }
    
    public PhotonTrackedTarget getBestTarget() {
        var result = getLatestResult();
        if (result.hasTargets()) {
            return result.getBestTarget();
        }
        return null;
    }
    
    public double getTargetYaw() {
        var target = getBestTarget();
        if (target != null) {
            return target.getYaw();
        }
        return 0.0;
    }
    
    @Override
    public void periodic() {
        SmartDashboard.putBoolean("Has Target", hasTargets());
        SmartDashboard.putNumber("Target Yaw", getTargetYaw());
    }
}`,
    language: "java",
    category: "vision",
    tags: ["photonvision", "apriltag", "camera"]
  },

  // ODOMETRY - Java
  {
    title: "Differential Drive Odometry",
    description: "Track robot position using encoders and gyro",
    code: `import edu.wpi.first.math.geometry.Pose2d;
import edu.wpi.first.math.geometry.Rotation2d;
import edu.wpi.first.math.kinematics.DifferentialDriveOdometry;
import edu.wpi.first.math.kinematics.DifferentialDriveWheelSpeeds;

public class DriveSubsystem extends SubsystemBase {
    private final Encoder leftEncoder = new Encoder(0, 1);
    private final Encoder rightEncoder = new Encoder(2, 3);
    private final ADXRS450_Gyro gyro = new ADXRS450_Gyro();
    
    private final DifferentialDriveOdometry odometry;
    
    public DriveSubsystem() {
        leftEncoder.setDistancePerPulse(Math.PI * 0.15 / 2048);
        rightEncoder.setDistancePerPulse(Math.PI * 0.15 / 2048);
        
        odometry = new DifferentialDriveOdometry(
            gyro.getRotation2d(),
            leftEncoder.getDistance(),
            rightEncoder.getDistance()
        );
    }
    
    @Override
    public void periodic() {
        // Update odometry
        odometry.update(
            gyro.getRotation2d(),
            leftEncoder.getDistance(),
            rightEncoder.getDistance()
        );
        
        SmartDashboard.putString("Pose", getPose().toString());
    }
    
    public Pose2d getPose() {
        return odometry.getPoseMeters();
    }
    
    public void resetOdometry(Pose2d pose) {
        leftEncoder.reset();
        rightEncoder.reset();
        odometry.resetPosition(
            gyro.getRotation2d(),
            leftEncoder.getDistance(),
            rightEncoder.getDistance(),
            pose
        );
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["odometry", "pose", "tracking"]
  },

  // PYTHON EXAMPLES
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
        # Tank drive
        self.drive.tankDrive(
            -self.controller.getLeftY(),
            -self.controller.getRightY()
        )`,
    language: "python",
    category: "motor",
    tags: ["tank-drive", "python", "basic"]
  },
  {
    title: "PID Controller (Python)",
    description: "Basic PID controller in Python",
    code: `import wpilib
from wpimath.controller import PIDController

class ElevatorSubsystem:
    def __init__(self):
        self.motor = wpilib.PWMSparkMax(0)
        self.encoder = wpilib.Encoder(0, 1)
        
        # PID constants
        self.pid = PIDController(0.5, 0.0, 0.0)
        self.target_position = 0
    
    def set_target_position(self, position):
        self.target_position = position
    
    def periodic(self):
        current_position = self.encoder.getDistance()
        output = self.pid.calculate(current_position, self.target_position)
        
        self.motor.set(output)
        
        wpilib.SmartDashboard.putNumber("Position", current_position)
        wpilib.SmartDashboard.putNumber("Target", self.target_position)`,
    language: "python",
    category: "autonomous",
    tags: ["pid", "python", "control"]
  },

  // C++ EXAMPLES
  {
    title: "Differential Drive (C++)",
    description: "Tank drive implementation in C++",
    code: `#include <frc/TimedRobot.h>
#include <frc/motorcontrol/PWMSparkMax.h>
#include <frc/drive/DifferentialDrive.h>
#include <frc/XboxController.h>

class Robot : public frc::TimedRobot {
public:
    void RobotInit() override {
        m_leftMotor = std::make_unique<frc::PWMSparkMax>(0);
        m_rightMotor = std::make_unique<frc::PWMSparkMax>(1);
        
        m_drive = std::make_unique<frc::DifferentialDrive>(
            *m_leftMotor, *m_rightMotor
        );
        
        m_controller = std::make_unique<frc::XboxController>(0);
    }
    
    void TeleopPeriodic() override {
        m_drive->ArcadeDrive(
            -m_controller->GetLeftY(),
            -m_controller->GetRightX()
        );
    }

private:
    std::unique_ptr<frc::PWMSparkMax> m_leftMotor;
    std::unique_ptr<frc::PWMSparkMax> m_rightMotor;
    std::unique_ptr<frc::DifferentialDrive> m_drive;
    std::unique_ptr<frc::XboxController> m_controller;
};`,
    language: "cpp",
    category: "motor",
    tags: ["differential-drive", "cpp", "arcade"]
  },
  {
    title: "Encoder with PID (C++)",
    description: "Encoder reading with PID control in C++",
    code: `#include <frc2/command/SubsystemBase.h>
#include <frc/Encoder.h>
#include <frc/motorcontrol/PWMSparkMax.h>
#include <frc/controller/PIDController.h>

class ElevatorSubsystem : public frc2::SubsystemBase {
public:
    ElevatorSubsystem() {
        m_encoder.SetDistancePerPulse(0.1);
    }
    
    void SetTargetPosition(double position) {
        m_targetPosition = position;
    }
    
    void Periodic() override {
        double currentPosition = m_encoder.GetDistance();
        double output = m_pid.Calculate(currentPosition, m_targetPosition);
        
        m_motor.Set(output);
        
        frc::SmartDashboard::PutNumber("Position", currentPosition);
        frc::SmartDashboard::PutNumber("Target", m_targetPosition);
    }

private:
    frc::PWMSparkMax m_motor{0};
    frc::Encoder m_encoder{0, 1};
    frc::PIDController m_pid{0.5, 0.0, 0.0};
    double m_targetPosition{0.0};
};`,
    language: "cpp",
    category: "sensor",
    tags: ["encoder", "pid", "cpp"]
  },

  // SIMULATION
  {
    title: "Drivetrain Simulation",
    description: "Simulate differential drivetrain physics",
    code: `import edu.wpi.first.wpilibj.simulation.DifferentialDrivetrainSim;
import edu.wpi.first.wpilibj.simulation.EncoderSim;
import edu.wpi.first.math.system.plant.DCMotor;

public class DriveSubsystem extends SubsystemBase {
    private final DifferentialDrive drive;
    private final Encoder leftEncoder;
    private final Encoder rightEncoder;
    
    // Simulation
    private final DifferentialDrivetrainSim driveSim;
    private final EncoderSim leftEncoderSim;
    private final EncoderSim rightEncoderSim;
    
    public DriveSubsystem() {
        // Real hardware setup
        drive = new DifferentialDrive(leftMotor, rightMotor);
        leftEncoder = new Encoder(0, 1);
        rightEncoder = new Encoder(2, 3);
        
        // Simulation setup
        driveSim = new DifferentialDrivetrainSim(
            DCMotor.getNEO(2),      // 2 NEO motors per side
            7.5,                    // Gear ratio
            2.0,                    // MOI
            27.0,                   // Robot mass (kg)
            Units.inchesToMeters(3),// Wheel radius
            0.6,                    // Track width (m)
            null                    // Measurement std devs (null = no noise)
        );
        
        leftEncoderSim = new EncoderSim(leftEncoder);
        rightEncoderSim = new EncoderSim(rightEncoder);
    }
    
    @Override
    public void simulationPeriodic() {
        // Update simulation with motor voltages
        driveSim.setInputs(
            leftMotor.get() * 12.0,
            rightMotor.get() * 12.0
        );
        
        // Advance simulation by 20ms
        driveSim.update(0.02);
        
        // Update encoder simulations
        leftEncoderSim.setDistance(driveSim.getLeftPositionMeters());
        rightEncoderSim.setDistance(driveSim.getRightPositionMeters());
        
        leftEncoderSim.setRate(driveSim.getLeftVelocityMetersPerSecond());
        rightEncoderSim.setRate(driveSim.getRightVelocityMetersPerSecond());
    }
}`,
    language: "java",
    category: "other",
    tags: ["simulation", "drivetrain", "testing"]
  }
];

async function main() {
  try {
    console.log('🌱 Starting snippet seeding...');
    
    // Get or create admin user for snippets
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }
    
    console.log(`📝 Found admin user: ${adminUser.email}`);
    
    // Create snippets
    let created = 0;
    let skipped = 0;
    
    for (const snippet of snippets) {
      // Check if snippet already exists
      const existing = await prisma.codeSnippet.findFirst({
        where: {
          title: snippet.title,
          userId: adminUser.id
        }
      });
      
      if (existing) {
        console.log(`⏭️  Skipping: ${snippet.title} (already exists)`);
        skipped++;
        continue;
      }
      
      await prisma.codeSnippet.create({
        data: {
          ...snippet,
          userId: adminUser.id,
          isPublic: true,
          viewCount: 0,
          favoriteCount: 0
        }
      });
      
      console.log(`✅ Created: ${snippet.title}`);
      created++;
    }
    
    console.log(`\n🎉 Seeding complete!`);
    console.log(`   Created: ${created} snippets`);
    console.log(`   Skipped: ${skipped} snippets`);
    
  } catch (error) {
    console.error('❌ Error seeding snippets:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

