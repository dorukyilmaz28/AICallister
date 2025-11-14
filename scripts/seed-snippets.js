require('dotenv').config();
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
  },

  // ADVANCED TRAJECTORY & PATH PLANNING
  {
    title: "PathPlanner Trajectory Following",
    description: "Follow PathPlanner trajectories with Ramsete controller for smooth autonomous paths",
    code: `import com.pathplanner.lib.PathPlanner;
import com.pathplanner.lib.PathPlannerTrajectory;
import edu.wpi.first.math.controller.RamseteController;
import edu.wpi.first.math.kinematics.DifferentialDriveKinematics;
import edu.wpi.first.math.kinematics.DifferentialDriveOdometry;
import edu.wpi.first.wpilibj2.command.RamseteCommand;

public class AutonomousTrajectory {
    private final DifferentialDrive drive;
    private final DifferentialDriveOdometry odometry;
    private final DifferentialDriveKinematics kinematics;
    private final RamseteController ramseteController;
    
    public AutonomousTrajectory() {
        // Initialize kinematics (track width in meters)
        kinematics = new DifferentialDriveKinematics(0.6);
        
        // Initialize Ramsete controller
        ramseteController = new RamseteController(2.0, 0.7);
        
        // Load trajectory from PathPlanner
        PathPlannerTrajectory trajectory = PathPlanner.loadPath(
            "ExamplePath",  // Path name
            2.0,            // Max velocity (m/s)
            1.5             // Max acceleration (m/s²)
        );
        
        // Create Ramsete command
        RamseteCommand ramseteCommand = new RamseteCommand(
            trajectory,
            odometry::getPose,
            ramseteController,
            kinematics,
            drive::tankDriveVolts,
            drive
        );
    }
    
    public void followPath() {
        // Reset odometry to starting pose
        odometry.resetPosition(
            trajectory.getInitialPose(),
            gyro.getRotation2d()
        );
        
        // Schedule and run command
        ramseteCommand.schedule();
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["pathplanner", "trajectory", "ramsete", "advanced"]
  },
  {
    title: "ProfiledPIDController for Elevator",
    description: "Advanced ProfiledPIDController for smooth elevator motion with constraints",
    code: `import edu.wpi.first.math.controller.ProfiledPIDController;
import edu.wpi.first.math.trajectory.TrapezoidProfile;
import edu.wpi.first.wpilibj2.command.ProfiledPIDSubsystem;

public class ElevatorSubsystem extends ProfiledPIDSubsystem {
    private final PWMSparkMax motor = new PWMSparkMax(0);
    private final Encoder encoder = new Encoder(0, 1);
    
    // Motion constraints: max velocity (m/s), max acceleration (m/s²)
    private static final TrapezoidProfile.Constraints constraints = 
        new TrapezoidProfile.Constraints(2.0, 1.5);
    
    public ElevatorSubsystem() {
        super(
            new ProfiledPIDController(
                0.5,  // kP
                0.0,  // kI
                0.0,  // kD
                constraints
            ),
            0.0  // Initial position
        );
        
        encoder.setDistancePerPulse(0.01); // 1cm per pulse
        setGoal(0.0); // Start at bottom
    }
    
    @Override
    protected void useOutput(double output, TrapezoidProfile.State setpoint) {
        // Feedforward + PID output
        double feedforward = 0.1; // Gravity compensation
        motor.setVoltage(output + feedforward);
    }
    
    @Override
    protected double getMeasurement() {
        return encoder.getDistance();
    }
    
    public void setTargetHeight(double height) {
        setGoal(height);
    }
    
    public boolean atGoal() {
        return getController().atGoal();
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["profiled-pid", "elevator", "motion-profile", "advanced"]
  },
  {
    title: "Swerve Drive Kinematics (4 Modules)",
    description: "Complete swerve drive implementation with kinematics and odometry",
    code: `import edu.wpi.first.math.geometry.Pose2d;
import edu.wpi.first.math.geometry.Rotation2d;
import edu.wpi.first.math.kinematics.*;
import edu.wpi.first.math.trajectory.Trajectory;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class SwerveDriveSubsystem extends SubsystemBase {
    // Module positions relative to robot center (in meters)
    private static final Translation2d frontLeftLocation = 
        new Translation2d(0.3, 0.3);
    private static final Translation2d frontRightLocation = 
        new Translation2d(0.3, -0.3);
    private static final Translation2d backLeftLocation = 
        new Translation2d(-0.3, 0.3);
    private static final Translation2d backRightLocation = 
        new Translation2d(-0.3, -0.3);
    
    private final SwerveModule frontLeft;
    private final SwerveModule frontRight;
    private final SwerveModule backLeft;
    private final SwerveModule backRight;
    
    private final SwerveDriveKinematics kinematics = new SwerveDriveKinematics(
        frontLeftLocation, frontRightLocation,
        backLeftLocation, backRightLocation
    );
    
    private final SwerveDriveOdometry odometry;
    private final ADXRS450_Gyro gyro = new ADXRS450_Gyro();
    
    public SwerveDriveSubsystem() {
        frontLeft = new SwerveModule(0, 1, 0, 1, 0);
        frontRight = new SwerveModule(2, 3, 2, 3, 1);
        backLeft = new SwerveModule(4, 5, 4, 5, 2);
        backRight = new SwerveModule(6, 7, 6, 7, 3);
        
        odometry = new SwerveDriveOdometry(
            kinematics,
            gyro.getRotation2d(),
            getModulePositions(),
            new Pose2d()
        );
    }
    
    public void drive(double xSpeed, double ySpeed, double rot, boolean fieldRelative) {
        SwerveModuleState[] states = kinematics.toSwerveModuleStates(
            fieldRelative
                ? ChassisSpeeds.fromFieldRelativeSpeeds(
                    xSpeed, ySpeed, rot, gyro.getRotation2d())
                : new ChassisSpeeds(xSpeed, ySpeed, rot)
        );
        
        SwerveDriveKinematics.desaturateWheelSpeeds(states, 4.0);
        
        frontLeft.setDesiredState(states[0]);
        frontRight.setDesiredState(states[1]);
        backLeft.setDesiredState(states[2]);
        backRight.setDesiredState(states[3]);
    }
    
    @Override
    public void periodic() {
        odometry.update(
            gyro.getRotation2d(),
            getModulePositions()
        );
    }
    
    public Pose2d getPose() {
        return odometry.getPoseMeters();
    }
    
    public void resetOdometry(Pose2d pose) {
        odometry.resetPosition(gyro.getRotation2d(), getModulePositions(), pose);
    }
    
    private SwerveModulePosition[] getModulePositions() {
        return new SwerveModulePosition[] {
            frontLeft.getPosition(),
            frontRight.getPosition(),
            backLeft.getPosition(),
            backRight.getPosition()
        };
    }
}`,
    language: "java",
    category: "motor",
    tags: ["swerve", "kinematics", "odometry", "advanced"]
  },
  {
    title: "Holonomic Drive (Mecanum/X-Drive)",
    description: "Holonomic drive using MecanumDriveKinematics for omnidirectional movement",
    code: `import edu.wpi.first.math.geometry.Translation2d;
import edu.wpi.first.math.kinematics.MecanumDriveKinematics;
import edu.wpi.first.math.kinematics.MecanumDriveOdometry;
import edu.wpi.first.math.kinematics.MecanumDriveWheelSpeeds;
import edu.wpi.first.wpilibj.drive.MecanumDrive;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class MecanumDriveSubsystem extends SubsystemBase {
    private final PWMSparkMax frontLeft = new PWMSparkMax(0);
    private final PWMSparkMax frontRight = new PWMSparkMax(1);
    private final PWMSparkMax rearLeft = new PWMSparkMax(2);
    private final PWMSparkMax rearRight = new PWMSparkMax(3);
    
    private final MecanumDrive drive = new MecanumDrive(
        frontLeft, frontRight, rearLeft, rearRight
    );
    
    // Wheel positions relative to robot center
    private final MecanumDriveKinematics kinematics = new MecanumDriveKinematics(
        new Translation2d(0.3, 0.3),   // front left
        new Translation2d(0.3, -0.3),   // front right
        new Translation2d(-0.3, 0.3),   // rear left
        new Translation2d(-0.3, -0.3)   // rear right
    );
    
    private final MecanumDriveOdometry odometry;
    private final ADXRS450_Gyro gyro = new ADXRS450_Gyro();
    
    public MecanumDriveSubsystem() {
        drive.setSafetyEnabled(false);
        odometry = new MecanumDriveOdometry(
            kinematics,
            gyro.getRotation2d()
        );
    }
    
    public void driveCartesian(double xSpeed, double ySpeed, double zRotation) {
        drive.driveCartesian(ySpeed, xSpeed, zRotation, gyro.getRotation2d());
    }
    
    public void drivePolar(double magnitude, double angle, double zRotation) {
        drive.drivePolar(magnitude, angle, zRotation);
    }
    
    @Override
    public void periodic() {
        odometry.update(
            gyro.getRotation2d(),
            new MecanumDriveWheelSpeeds(
                frontLeft.get(),
                frontRight.get(),
                rearLeft.get(),
                rearRight.get()
            )
        );
    }
    
    public Pose2d getPose() {
        return odometry.getPoseMeters();
    }
}`,
    language: "java",
    category: "motor",
    tags: ["mecanum", "holonomic", "kinematics", "advanced"]
  },
  {
    title: "Advanced PID with Feedforward (Arm Control)",
    description: "Arm control with PID + Feedforward for gravity compensation and motion control",
    code: `import edu.wpi.first.math.controller.ArmFeedforward;
import edu.wpi.first.math.controller.PIDController;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class ArmSubsystem extends SubsystemBase {
    private final PWMSparkMax motor = new PWMSparkMax(0);
    private final Encoder encoder = new Encoder(0, 1);
    private final AnalogPotentiometer potentiometer = new AnalogPotentiometer(0);
    
    // PID Controller
    private final PIDController pidController = new PIDController(0.5, 0.0, 0.0);
    
    // Feedforward for gravity compensation
    // kS: Static friction, kG: Gravity, kV: Velocity, kA: Acceleration
    private final ArmFeedforward feedforward = new ArmFeedforward(
        0.1,  // kS (static friction)
        0.5,  // kG (gravity compensation)
        0.12, // kV (velocity feedforward)
        0.01  // kA (acceleration feedforward)
    );
    
    private double targetAngle = 0.0; // radians
    private double lastVelocity = 0.0;
    
    public ArmSubsystem() {
        encoder.setDistancePerPulse(Math.PI / 180.0); // Convert to radians
        pidController.setTolerance(0.05); // 0.05 rad tolerance
    }
    
    public void setTargetAngle(double angle) {
        targetAngle = Math.max(0.0, Math.min(Math.PI, angle)); // Clamp to [0, π]
    }
    
    @Override
    public void periodic() {
        double currentAngle = potentiometer.get(); // Already in radians
        double currentVelocity = encoder.getRate();
        double acceleration = (currentVelocity - lastVelocity) / 0.02; // 20ms loop
        
        // Calculate PID output
        double pidOutput = pidController.calculate(currentAngle, targetAngle);
        
        // Calculate feedforward
        double ffOutput = feedforward.calculate(
            targetAngle,      // Setpoint angle
            currentVelocity,  // Current velocity
            acceleration      // Current acceleration
        );
        
        // Combine outputs
        double output = pidOutput + ffOutput;
        motor.setVoltage(output);
        
        lastVelocity = currentVelocity;
        
        SmartDashboard.putNumber("Arm Angle", Math.toDegrees(currentAngle));
        SmartDashboard.putNumber("Arm Target", Math.toDegrees(targetAngle));
        SmartDashboard.putBoolean("Arm At Goal", pidController.atSetpoint());
    }
    
    public boolean atGoal() {
        return pidController.atSetpoint();
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["pid", "feedforward", "arm", "gravity-compensation", "advanced"]
  },
  {
    title: "PathPlanner AutoBuilder Integration",
    description: "Complete PathPlanner AutoBuilder setup for autonomous routines",
    code: `import com.pathplanner.lib.PathPlanner;
import com.pathplanner.lib.PathPlannerTrajectory;
import com.pathplanner.lib.commands.PPSwerveControllerCommand;
import com.pathplanner.lib.auto.SwerveAutoBuilder;
import edu.wpi.first.math.controller.PIDController;
import edu.wpi.first.math.geometry.Pose2d;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.InstantCommand;
import edu.wpi.first.wpilibj2.command.SequentialCommandGroup;

public class AutonomousCommands {
    private final SwerveDriveSubsystem drive;
    private final SwerveAutoBuilder autoBuilder;
    
    public AutonomousCommands(SwerveDriveSubsystem drive) {
        this.drive = drive;
        
        // Create AutoBuilder
        autoBuilder = new SwerveAutoBuilder(
            drive::getPose,                    // Pose supplier
            drive::resetOdometry,               // Reset pose
            drive.getKinematics(),              // Kinematics
            new PIDController(0.5, 0, 0),       // X controller
            new PIDController(0.5, 0, 0),       // Y controller
            new PIDController(0.5, 0, 0),       // Rotation controller
            drive::setModuleStates,             // Module states consumer
            null,                               // Path following config
            drive                                // Requirements
        );
    }
    
    public Command getAutonomousCommand(String pathName) {
        // Load path group
        List<PathPlannerTrajectory> pathGroup = PathPlanner.loadPathGroup(
            pathName,
            2.0,  // Max velocity
            1.5   // Max acceleration
        );
        
        // Build command sequence
        List<Command> commands = new ArrayList<>();
        
        for (PathPlannerTrajectory trajectory : pathGroup) {
            commands.add(
                new PPSwerveControllerCommand(
                    trajectory,
                    drive::getPose,
                    drive.getKinematics(),
                    new PIDController(0.5, 0, 0),  // X
                    new PIDController(0.5, 0, 0),  // Y
                    new PIDController(0.5, 0, 0),  // Rotation
                    drive::setModuleStates,
                    drive
                )
            );
        }
        
        return new SequentialCommandGroup(
            new InstantCommand(() -> 
                drive.resetOdometry(pathGroup.get(0).getInitialPose())
            ),
            commands.toArray(new Command[0])
        );
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["pathplanner", "autobuilder", "swerve", "advanced"]
  },
  {
    title: "Vision-Based Alignment (Limelight)",
    description: "Align robot to target using Limelight vision processing",
    code: `import edu.wpi.first.networktables.NetworkTable;
import edu.wpi.first.networktables.NetworkTableInstance;
import edu.wpi.first.wpilibj2.command.CommandBase;
import edu.wpi.first.math.controller.PIDController;

public class VisionAlignCommand extends CommandBase {
    private final DriveSubsystem drive;
    private final NetworkTable limelight;
    private final PIDController turnController;
    
    private static final double TARGET_X = 0.0; // Center of screen
    private static final double TOLERANCE = 1.0; // degrees
    
    public VisionAlignCommand(DriveSubsystem drive) {
        this.drive = drive;
        this.limelight = NetworkTableInstance.getDefault().getTable("limelight");
        
        turnController = new PIDController(0.05, 0.0, 0.0);
        turnController.setTolerance(TOLERANCE);
        turnController.setSetpoint(TARGET_X);
        
        addRequirements(drive);
    }
    
    @Override
    public void initialize() {
        // Turn on LED and set pipeline
        limelight.getEntry("ledMode").setNumber(3); // Force on
        limelight.getEntry("pipeline").setNumber(0);
    }
    
    @Override
    public void execute() {
        boolean hasTarget = limelight.getEntry("tv").getDouble(0) == 1.0;
        
        if (hasTarget) {
            double tx = limelight.getEntry("tx").getDouble(0.0);
            double ty = limelight.getEntry("ty").getDouble(0.0);
            double ta = limelight.getEntry("ta").getDouble(0.0);
            
            // Calculate turn output
            double turnOutput = turnController.calculate(tx);
            
            // Drive forward while aligning (adjust speed based on distance)
            double forwardSpeed = 0.3;
            
            drive.arcadeDrive(forwardSpeed, turnOutput);
            
            SmartDashboard.putNumber("Limelight X", tx);
            SmartDashboard.putNumber("Limelight Y", ty);
            SmartDashboard.putNumber("Target Area", ta);
        } else {
            // No target, stop
            drive.arcadeDrive(0, 0);
        }
    }
    
    @Override
    public boolean isFinished() {
        boolean hasTarget = limelight.getEntry("tv").getDouble(0) == 1.0;
        double tx = limelight.getEntry("tx").getDouble(0.0);
        
        return hasTarget && Math.abs(tx) < TOLERANCE;
    }
    
    @Override
    public void end(boolean interrupted) {
        drive.arcadeDrive(0, 0);
        limelight.getEntry("ledMode").setNumber(1); // Force off
    }
}`,
    language: "java",
    category: "vision",
    tags: ["limelight", "vision", "alignment", "pid", "advanced"]
  },
  {
    title: "Advanced State Machine (Autonomous)",
    description: "Complex autonomous routine with state machine pattern",
    code: `import edu.wpi.first.wpilibj.Timer;
import edu.wpi.first.wpilibj2.command.CommandBase;

public class ComplexAutoCommand extends CommandBase {
    private enum AutoState {
        INIT,
        DRIVE_FORWARD,
        INTAKE_CUBE,
        TURN_TO_GOAL,
        AIM_AT_GOAL,
        SHOOT,
        BACKUP,
        DONE
    }
    
    private final DriveSubsystem drive;
    private final IntakeSubsystem intake;
    private final ShooterSubsystem shooter;
    private final VisionSubsystem vision;
    
    private AutoState currentState = AutoState.INIT;
    private Timer stateTimer = new Timer();
    private double startX, startY;
    
    public ComplexAutoCommand(DriveSubsystem drive, IntakeSubsystem intake,
                             ShooterSubsystem shooter, VisionSubsystem vision) {
        this.drive = drive;
        this.intake = intake;
        this.shooter = shooter;
        this.vision = vision;
        
        addRequirements(drive, intake, shooter, vision);
    }
    
    @Override
    public void initialize() {
        currentState = AutoState.INIT;
        stateTimer.reset();
        stateTimer.start();
        
        startX = drive.getPose().getX();
        startY = drive.getPose().getY();
    }
    
    @Override
    public void execute() {
        switch (currentState) {
            case INIT:
                drive.resetOdometry(new Pose2d());
                transitionTo(AutoState.DRIVE_FORWARD);
                break;
                
            case DRIVE_FORWARD:
                drive.arcadeDrive(0.5, 0);
                if (drive.getPose().getX() > 2.0) {
                    transitionTo(AutoState.INTAKE_CUBE);
                }
                break;
                
            case INTAKE_CUBE:
                intake.setSpeed(0.8);
                if (intake.hasCube() || stateTimer.get() > 2.0) {
                    intake.setSpeed(0);
                    transitionTo(AutoState.TURN_TO_GOAL);
                }
                break;
                
            case TURN_TO_GOAL:
                double angleToGoal = Math.atan2(
                    vision.getGoalY() - drive.getPose().getY(),
                    vision.getGoalX() - drive.getPose().getX()
                );
                double currentAngle = drive.getPose().getRotation().getRadians();
                double error = angleToGoal - currentAngle;
                
                if (Math.abs(error) < 0.1) {
                    transitionTo(AutoState.AIM_AT_GOAL);
                } else {
                    drive.arcadeDrive(0, Math.signum(error) * 0.5);
                }
                break;
                
            case AIM_AT_GOAL:
                if (vision.isAligned()) {
                    transitionTo(AutoState.SHOOT);
                } else {
                    vision.align();
                }
                break;
                
            case SHOOT:
                shooter.setVelocity(3000); // RPM
                if (shooter.atVelocity() && stateTimer.get() > 0.5) {
                    intake.setSpeed(-0.5); // Eject
                    if (stateTimer.get() > 1.5) {
                        transitionTo(AutoState.BACKUP);
                    }
                }
                break;
                
            case BACKUP:
                drive.arcadeDrive(-0.3, 0);
                if (drive.getPose().getX() < startX - 0.5) {
                    transitionTo(AutoState.DONE);
                }
                break;
                
            case DONE:
                drive.arcadeDrive(0, 0);
                break;
        }
    }
    
    private void transitionTo(AutoState newState) {
        currentState = newState;
        stateTimer.reset();
        stateTimer.start();
    }
    
    @Override
    public boolean isFinished() {
        return currentState == AutoState.DONE;
    }
    
    @Override
    public void end(boolean interrupted) {
        drive.arcadeDrive(0, 0);
        intake.setSpeed(0);
        shooter.setVelocity(0);
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["state-machine", "autonomous", "complex", "advanced"]
  },
  {
    title: "Characterization (SysId) Integration",
    description: "Motor characterization using WPILib SysId tools",
    code: `import edu.wpi.first.wpilibj.sysid.SysIdRoutineLog;
import edu.wpi.first.wpilibj2.command.SubsystemBase;
import edu.wpi.first.wpilibj2.command.sysid.SysIdRoutine;

public class ShooterCharacterization extends SubsystemBase {
    private final PWMSparkMax motor = new PWMSparkMax(0);
    private final Encoder encoder = new Encoder(0, 1);
    
    // SysId routine for characterization
    private final SysIdRoutine sysIdRoutine = new SysIdRoutine(
        new SysIdRoutine.Config(
            null,                    // Default ramp rate
            null,                    // Default timeout
            null,                    // Default log period
            null                     // Default timeout
        ),
        new SysIdRoutine.Mechanism(
            (voltage) -> motor.setVoltage(voltage),
            (log) -> {
                log.motor("shooter")
                   .voltage(edu.wpi.first.units.Units.Volts.of(motor.get() * 12))
                   .angularPosition(edu.wpi.first.units.Units.Rotations.of(encoder.getDistance()))
                   .angularVelocity(edu.wpi.first.units.Units.RotationsPerSecond.of(encoder.getRate()));
            },
            this
        )
    );
    
    public Command quasistaticForward() {
        return sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
    }
    
    public Command quasistaticReverse() {
        return sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
    }
    
    public Command dynamicForward() {
        return sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
    }
    
    public Command dynamicReverse() {
        return sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
    }
    
    // After running SysId, use the calculated feedforward gains:
    // kS: Static friction
    // kV: Velocity feedforward
    // kA: Acceleration feedforward
}`,
    language: "java",
    category: "other",
    tags: ["sysid", "characterization", "feedforward", "advanced"]
  },
  {
    title: "Advanced Command Composition",
    description: "Complex command groups with parallel and sequential execution",
    code: `import edu.wpi.first.wpilibj2.command.*;
import edu.wpi.first.wpilibj2.command.button.Trigger;

public class AdvancedCommandComposition {
    private final DriveSubsystem drive;
    private final IntakeSubsystem intake;
    private final ShooterSubsystem shooter;
    private final ElevatorSubsystem elevator;
    
    // Parallel command: Run multiple commands simultaneously
    public Command parallelIntakeAndDrive() {
        return new ParallelCommandGroup(
            new RunCommand(() -> intake.setSpeed(0.8), intake),
            new RunCommand(() -> drive.arcadeDrive(0.5, 0), drive)
        );
    }
    
    // Sequential with deadline: Stop if timeout
    public Command timedSequence() {
        return new SequentialCommandGroup(
            new InstantCommand(() -> elevator.setHeight(1.0), elevator),
            new WaitUntilCommand(elevator::atGoal),
            new RunCommand(() -> shooter.setVelocity(3000), shooter)
                .withTimeout(2.0), // Deadline: 2 seconds
            new InstantCommand(() -> intake.eject(), intake)
        );
    }
    
    // Conditional command: Choose based on condition
    public Command conditionalAuto() {
        return new ConditionalCommand(
            new SequentialCommandGroup(
                new InstantCommand(() -> drive.driveTo(3.0, 0)),
                new InstantCommand(() -> shooter.shoot())
            ),
            new SequentialCommandGroup(
                new InstantCommand(() -> drive.driveTo(1.5, 0)),
                new InstantCommand(() -> intake.intake())
            ),
            () -> vision.hasTarget() // Condition
        );
    }
    
    // Race command: First to finish wins
    public Command raceToGoal() {
        return new RaceCommand(
            new WaitUntilCommand(() -> drive.getPose().getX() > 5.0),
            new RunCommand(() -> drive.arcadeDrive(0.6, 0), drive)
        );
    }
    
    // Select command: Choose from multiple options
    public Command selectByAlliance() {
        return new SelectCommand<>(
            Map.of(
                DriverStation.Alliance.Red,
                new InstantCommand(() -> drive.driveTo(5.0, 0)),
                DriverStation.Alliance.Blue,
                new InstantCommand(() -> drive.driveTo(-5.0, 0))
            ),
            DriverStation::getAlliance
        );
    }
    
    // Trigger-based commands
    public void setupTriggers() {
        new Trigger(() -> intake.hasCube())
            .onTrue(new InstantCommand(() -> shooter.prepare(), shooter));
            
        new Trigger(() -> shooter.atVelocity())
            .onTrue(new InstantCommand(() -> intake.eject(), intake));
    }
}`,
    language: "java",
    category: "autonomous",
    tags: ["command-groups", "parallel", "sequential", "advanced"]
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

