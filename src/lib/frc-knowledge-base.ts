// FRC Bilgi Tabanı - ChromaDB için hazırlanmış veriler

export const frcKnowledgeBase = [
  // WPILib Motor Controllers
  {
    id: "wpilib-motor-talon-fx",
    content: `TalonFX Motor Controller Kullanımı:
TalonFX, Falcon 500 motorlar için kullanılan güçlü bir motor controller'dır. CTRE Phoenix API ile kontrol edilir.

Temel Kullanım (Java):
TalonFX motor = new TalonFX(0); // CAN ID 0
motor.set(TalonFXControlMode.PercentOutput, 0.5); // %50 hız

PID Kontrolü:
motor.config_kP(0, 0.1);
motor.config_kI(0, 0.0);
motor.config_kD(0, 0.0);
motor.set(TalonFXControlMode.Position, 4096); // 1 devir

Özellikler:
- Integrated encoder (2048 CPR)
- Current limiting
- Voltage compensation
- Motion profiling
- CAN bus iletişimi

Dokümantasyon: https://docs.ctre-phoenix.com/`,
    metadata: {
      category: "motor-controller",
      topic: "talon-fx",
      language: "java",
      difficulty: "intermediate"
    }
  },
  {
    id: "wpilib-motor-spark-max",
    content: `SparkMAX Motor Controller Kullanımı:
SparkMAX, NEO ve NEO 550 brushless motorlar için REV Robotics motor controller'ıdır.

Temel Kullanım (Java):
CANSparkMax motor = new CANSparkMax(1, MotorType.kBrushless);
motor.set(0.75); // %75 hız

Encoder Okuma:
RelativeEncoder encoder = motor.getEncoder();
double position = encoder.getPosition(); // Rotasyonlar
double velocity = encoder.getVelocity(); // RPM

PID Kontrolü:
SparkMaxPIDController pidController = motor.getPIDController();
pidController.setP(0.1);
pidController.setI(0.0);
pidController.setD(0.0);
pidController.setReference(5000, CANSparkMax.ControlType.kVelocity);

Özellikler:
- Built-in encoder support
- Smart current limiting
- Data port for sensors
- RGB LED status indicator

Dokümantasyon: https://docs.revrobotics.com/`,
    metadata: {
      category: "motor-controller",
      topic: "spark-max",
      language: "java",
      difficulty: "intermediate"
    }
  },

  // Drive Systems
  {
    id: "wpilib-swerve-drive",
    content: `Swerve Drive Programlama:
Swerve drive, her tekerlerin hem hız hem de yönünü bağımsız kontrol eden gelişmiş bir sürüş sistemidir.

Temel Yapı:
- 4 swerve module (her biri drive + steering motor)
- Gyro (NavX, Pigeon 2.0)
- SwerveDriveKinematics
- SwerveDriveOdometry

Kod Örneği (Java):
// Kinematics oluştur
Translation2d frontLeft = new Translation2d(0.381, 0.381);
Translation2d frontRight = new Translation2d(0.381, -0.381);
Translation2d backLeft = new Translation2d(-0.381, 0.381);
Translation2d backRight = new Translation2d(-0.381, -0.381);

SwerveDriveKinematics kinematics = new SwerveDriveKinematics(
  frontLeft, frontRight, backLeft, backRight
);

// Sürüş
ChassisSpeeds speeds = ChassisSpeeds.fromFieldRelativeSpeeds(
  xSpeed, ySpeed, rotSpeed, gyro.getRotation2d()
);
SwerveModuleState[] states = kinematics.toSwerveModuleStates(speeds);

// Module'lara state gönder
frontLeftModule.setDesiredState(states[0]);
frontRightModule.setDesiredState(states[1]);
backLeftModule.setDesiredState(states[2]);
backRightModule.setDesiredState(states[3]);

Avantajları:
- Omni-directional hareket
- Yüksek manevra kabiliyeti
- Field-oriented control
- Defensive pozisyon (X-lock)

Zorluğu: İleri seviye mekanik ve programlama gerektirir

Popüler Kütüphaneler:
- YAGSL (Yet Another Generic Swerve Library)
- SDS Swerve Library
- Team 254 Swerve Code`,
    metadata: {
      category: "drive-system",
      topic: "swerve",
      language: "java",
      difficulty: "advanced"
    }
  },
  {
    id: "wpilib-differential-drive",
    content: `Differential Drive (Tank/Arcade Drive) Programlama:
En yaygın FRC sürüş sistemi. Sol ve sağ motor grupları ile kontrol edilir.

Temel Kullanım (Java):
DifferentialDrive drive = new DifferentialDrive(leftMotor, rightMotor);

// Arcade Drive (tek joystick)
drive.arcadeDrive(speed, rotation); // İleri/geri + dönüş

// Tank Drive (çift joystick)
drive.tankDrive(leftSpeed, rightSpeed); // Her taraf ayrı

// Curvature Drive (Mario Kart tarzı)
drive.curvatureDrive(speed, rotation, isQuickTurn);

Güvenlik Özellikleri:
drive.setMaxOutput(0.8); // Hız limiti
drive.setDeadband(0.02); // Joystick ölü bölge
drive.setSafetyEnabled(true); // Motor safety

Odometry (Konum Takibi):
DifferentialDriveOdometry odometry = new DifferentialDriveOdometry(
  gyro.getRotation2d(),
  leftEncoder.getDistance(),
  rightEncoder.getDistance()
);

// Periyodik güncelleme
odometry.update(
  gyro.getRotation2d(),
  leftEncoder.getDistance(),
  rightEncoder.getDistance()
);

Pose2d pose = odometry.getPoseMeters(); // Robotun konumu

Avantajları:
- Basit mekanik ve kod
- Güvenilir
- Rookie takımlar için ideal
- Geniş topluluk desteği`,
    metadata: {
      category: "drive-system",
      topic: "differential-drive",
      language: "java",
      difficulty: "beginner"
    }
  },

  // Autonomous
  {
    id: "wpilib-pathplanner",
    content: `PathPlanner Autonomous Programlama:
PathPlanner, FRC için GUI tabanlı trajectory planlama aracıdır.

Kurulum:
1. PathPlanner uygulamasını indir: pathplanner.dev
2. WPILib PathPlanner kütüphanesini ekle

Path Oluşturma:
- GUI'de waypoint'ler ekle
- Hız profilleri ayarla
- Event marker'lar ekle (intake, shoot, etc.)
- JSON olarak kaydet

Kod Kullanımı (Java):
// Path'i yükle
PathPlannerPath path = PathPlannerPath.fromPathFile("MyPath");

// Auto komut oluştur
Command followPath = AutoBuilder.followPath(path);

// Event'ler ile
HashMap<String, Command> eventMap = new HashMap<>();
eventMap.put("intake", new IntakeCommand());
eventMap.put("shoot", new ShootCommand());

Command autoCommand = new PathPlannerAuto("MyAuto");

// AutoBuilder konfigürasyonu
AutoBuilder.configureHolonomic(
  this::getPose,
  this::resetPose,
  this::getRobotRelativeSpeeds,
  this::driveRobotRelative,
  new HolonomicPathFollowerConfig(
    new PIDConstants(5.0, 0.0, 0.0), // Translation
    new PIDConstants(5.0, 0.0, 0.0), // Rotation
    4.5, // Max speed m/s
    0.4 // Drive base radius
  ),
  driveSubsystem
);

Özellikler:
- Swerve ve differential drive desteği
- Gerçek zamanlı path replanning
- Event markers
- Choreo entegrasyonu
- On-the-fly path generation

2024'te en popüler auto kütüphanesi!`,
    metadata: {
      category: "autonomous",
      topic: "pathplanner",
      language: "java",
      difficulty: "intermediate"
    }
  },

  // Vision
  {
    id: "wpilib-limelight",
    content: `Limelight Vision Camera Kullanımı:
Limelight, FRC için özel tasarlanmış vision kameradır.

NetworkTables ile Veri Alma (Java):
NetworkTable table = NetworkTableInstance.getDefault().getTable("limelight");
NetworkTableEntry tx = table.getEntry("tx"); // Yatay offset
NetworkTableEntry ty = table.getEntry("ty"); // Dikey offset
NetworkTableEntry ta = table.getEntry("ta"); // Hedef alanı
NetworkTableEntry tv = table.getEntry("tv"); // Geçerli hedef var mı?

double x = tx.getDouble(0.0);
double y = ty.getDouble(0.0);
double area = ta.getDouble(0.0);
boolean hasTarget = tv.getDouble(0) == 1;

Pipeline Kontrolü:
table.getEntry("pipeline").setNumber(0); // Pipeline değiştir

LED Kontrolü:
table.getEntry("ledMode").setNumber(3); // 0=pipeline, 1=off, 2=blink, 3=on

Mesafe Hesaplama:
double targetHeight = 2.5; // metre
double cameraHeight = 0.5; // metre
double cameraPitch = 30; // derece

double distance = (targetHeight - cameraHeight) / 
  Math.tan(Math.toRadians(cameraPitch + y));

Auto-Aim (Hedefe Dönme):
double kP = 0.1;
double rotationSpeed = -x * kP;
drive.arcadeDrive(0, rotationSpeed);

AprilTag Desteği:
Limelight 3 ile AprilTag tracking built-in
- Robot pose estimation
- Multi-tag triangulation
- MegaTag™ 2 (çok hassas pose)

Dokümantasyon: https://docs.limelightvision.io/`,
    metadata: {
      category: "vision",
      topic: "limelight",
      language: "java",
      difficulty: "intermediate"
    }
  },

  // FRC Strategy
  {
    id: "frc-strategy-scouting",
    content: `FRC Scouting Stratejisi:
Scouting, yarışmalarda rakip takımları analiz etmek için kritik öneme sahiptir.

Scouting Ne Ölçer?
- Auto puanı (game piece sayısı, mobility)
- Teleop performansı (cycle time, accuracy)
- Endgame (climb, trap, park)
- Savunma kabiliyeti
- Güvenilirlik (brownout, breakdown)
- Sürücü becerisi

Veri Toplama Yöntemleri:
1. Kağıt Formlar: Basit ama manuel
2. Tablet/Phone Apps: Pit Scout, Scouting Pass 2024
3. Custom Apps: Team 1678 (Citrus Circuits) gibi
4. Video Analysis: Zebra MotionWorks data

Analiz:
- Pick list oluşturma
- OPR (Offensive Power Rating)
- DPR (Defensive Power Rating)
- CCWM (Calculated Contribution to Winning Margin)

Alliance Selection:
- 1. Pick: Complementary (tamamlayıcı) robot
- 2. Pick: Specialist veya defensive robot
- Backup options hazırla

The Blue Alliance API:
TBA API ile istatistik ve match schedule çekebilirsin

En İyi Scouting Takımları:
- 1678 Citrus Circuits
- 254 The Cheesy Poofs
- 1323 MadTown Robotics`,
    metadata: {
      category: "strategy",
      topic: "scouting",
      difficulty: "beginner"
    }
  },

  // Game-Specific (2024 Crescendo)
  {
    id: "frc-2024-crescendo",
    content: `FRC 2024 Crescendo Oyun Stratejisi:
Crescendo, müzik temalı bir oyundur. Notes (turuncu halka) scoring yapar.

Scoring Locations:
- Speaker: Yüksek skorlu hedef (auto: 5pt, teleop: 2pt, amped: 5pt)
- Amp: Düşük skorlu hedef (1pt) ama Amplification için gerekli
- Trap: Endgame'de yüksek puan (5pt)

Auto Stratejisi:
- Mobility: 2pt (leave starting zone)
- 4 note auto: Preload + 3 note (ortalama 3.5 note auto iyi sayılır)
- Center line notes: Riskli ama değerli

Teleop Stratejisi:
- Speaker cycling: Hızlı intake + shooter combo
- Amp feeding: 2 note amp → 1 amplification
- Defense: Opponent'in cycle'ını bozma

Endgame:
- Hang: Zincire tırmanma (parked: 1pt, onstage: 3pt, harmony: 2pt ek)
- Trap: Note'u trap'e atma (5pt) - risk vs reward
- Spotlight: Robot stage'e dokunmalı (bonus multiplier)

Meta Stratejiler (2024):
- Fast cyclers: <6 saniye cycle time
- Amp bots: Amp'e 10+ note
- Climbers: Güvenilir 2-robot harmony
- Defense: Rakip auto/cycle'ını durdur

Top Robots (2024 Worlds):
- 1678: Ultra-fast speaker cycle
- 254: Precision shooter + defense
- 2056: Amp specialist
- 118: Balanced all-around`,
    metadata: {
      category: "game-strategy",
      topic: "crescendo-2024",
      year: 2024,
      difficulty: "intermediate"
    }
  },

  // Command-Based Programming
  {
    id: "wpilib-command-based",
    content: `WPILib Command-Based Programming:
Command-based framework, FRC kodunun modern yapılandırma metodudur.

Temel Kavramlar:
1. Subsystems: Robot'un fiziksel parçaları (Drivetrain, Intake, Shooter)
2. Commands: Subsystem'lara ne yapacaklarını söyler
3. Triggers: Command'ları başlatır (button press, sensor, condition)

Subsystem Örneği (Java):
public class DriveSubsystem extends SubsystemBase {
  private final DifferentialDrive drive;
  
  public DriveSubsystem() {
    drive = new DifferentialDrive(leftMotor, rightMotor);
  }
  
  public void arcadeDrive(double speed, double rotation) {
    drive.arcadeDrive(speed, rotation);
  }
  
  @Override
  public void periodic() {
    // Telemetry, safety checks
  }
}

Command Örneği:
public class DriveCommand extends CommandBase {
  private final DriveSubsystem drive;
  private final Supplier<Double> speed;
  private final Supplier<Double> rotation;
  
  public DriveCommand(DriveSubsystem drive, Supplier<Double> speed, Supplier<Double> rotation) {
    this.drive = drive;
    this.speed = speed;
    this.rotation = rotation;
    addRequirements(drive);
  }
  
  @Override
  public void execute() {
    drive.arcadeDrive(speed.get(), rotation.get());
  }
}

Command Kompozisyonu:
// Sıralı komutlar
new SequentialCommandGroup(
  new IntakeCommand(),
  new WaitCommand(0.5),
  new ShootCommand()
);

// Paralel komutlar
new ParallelCommandGroup(
  new DriveCommand(),
  new IntakeCommand()
);

// Deadline command
new ParallelDeadlineGroup(
  new WaitCommand(3), // Ana command
  new IntakeCommand() // 3 saniye sonra durur
);

Trigger Kullanımı:
new JoystickButton(controller, Button.kA.value)
  .onTrue(new IntakeCommand())
  .onFalse(new StopIntakeCommand());

RobotContainer:
RobotContainer, tüm subsystem ve command'ları bağlar

Avantajları:
- Temiz kod yapısı
- Test edilebilir
- Yeniden kullanılabilir
- Sim desteği

2015'ten beri FRC standardı!`,
    metadata: {
      category: "programming",
      topic: "command-based",
      language: "java",
      difficulty: "intermediate"
    }
  },

  // PID Control
  {
    id: "wpilib-pid-tuning",
    content: `PID Controller Tuning:
PID (Proportional-Integral-Derivative) control, robotlarda hassas kontrol için kullanılır.

PID Nedir?
- P (Proportional): Hataya orantılı tepki
- I (Integral): Kalıcı hatayı düzeltir
- D (Derivative): Aşmayı (overshoot) önler

Temel Denklem:
output = kP * error + kI * integral + kD * derivative

WPILib PID (Java):
PIDController pid = new PIDController(kP, kI, kD);
pid.setSetpoint(target);
double output = pid.calculate(measurement);

Tuning Süreci:
1. Tüm gains'i sıfırla
2. kP'yi artır: Hızlı tepki, ama oscilation başlayana kadar
3. kD ekle: Oscilation'ı azalt
4. kI ekle (gerekirse): Steady-state error'u düzelt

Ziegler-Nichols Metodu:
1. Sadece kP kullan, oscilation'a kadar artır (Ku)
2. Oscilation periyodunu ölç (Tu)
3. Hesapla:
   kP = 0.6 * Ku
   kI = 2 * kP / Tu
   kD = kP * Tu / 8

Pratik İpuçları:
- Başlangıç: kP=0.1, kI=0.0, kD=0.0
- Motor control: Genelde I gerekmez
- Position control: I yararlı olabilir
- Velocity control: D nadiren gerekir

SmartDashboard ile Live Tuning:
SmartDashboard.putNumber("kP", kP);
SmartDashboard.putNumber("kI", kI);
SmartDashboard.putNumber("kD", kD);

double kP = SmartDashboard.getNumber("kP", 0.1);
// PID gains'i güncelle

Feedforward (FF):
PID'ye ek olarak feedforward eklemek performansı artırır
output = pid.calculate(measurement) + feedforward.calculate(setpoint);

Popüler FF türleri:
- SimpleMotorFeedforward: kS + kV * velocity + kA * acceleration
- ArmFeedforward: Motor + gravity compensation
- ElevatorFeedforward: Motor + friction`,
    metadata: {
      category: "control-theory",
      topic: "pid-tuning",
      language: "java",
      difficulty: "advanced"
    }
  },

  // Robot Code Structure
  {
    id: "frc-robot-code-structure",
    content: `FRC Robot Code Yapısı (Best Practices):
Modern FRC robot kod organizasyonu

Dizin Yapısı:
src/main/java/frc/robot/
├── Robot.java              # Ana robot sınıfı
├── RobotContainer.java     # Subsystem & command bağlantıları
├── Constants.java          # Tüm sabitler
├── subsystems/
│   ├── DriveSubsystem.java
│   ├── IntakeSubsystem.java
│   └── ShooterSubsystem.java
├── commands/
│   ├── DriveCommand.java
│   ├── AutoCommand.java
│   └── ShootCommand.java
└── util/
    ├── SwerveModule.java
    └── Helpers.java

Constants.java Organizasyonu:
public final class Constants {
  public static final class DriveConstants {
    public static final int LEFT_MOTOR_ID = 1;
    public static final int RIGHT_MOTOR_ID = 2;
    public static final double WHEEL_DIAMETER = 0.1524; // meters
  }
  
  public static final class ShooterConstants {
    public static final int SHOOTER_MOTOR_ID = 5;
    public static final double SHOOTER_KP = 0.1;
    public static final double SHOOTER_KV = 0.05;
  }
  
  public static final class OIConstants {
    public static final int DRIVER_CONTROLLER = 0;
    public static final int OPERATOR_CONTROLLER = 1;
  }
}

Robot.java (Minimal):
public class Robot extends TimedRobot {
  private Command autonomousCommand;
  private RobotContainer robotContainer;

  @Override
  public void robotInit() {
    robotContainer = new RobotContainer();
  }

  @Override
  public void autonomousInit() {
    autonomousCommand = robotContainer.getAutonomousCommand();
    if (autonomousCommand != null) {
      autonomousCommand.schedule();
    }
  }
}

RobotContainer.java (Hub):
public class RobotContainer {
  private final DriveSubsystem driveSubsystem = new DriveSubsystem();
  private final IntakeSubsystem intakeSubsystem = new IntakeSubsystem();
  
  private final XboxController driverController = new XboxController(0);
  
  public RobotContainer() {
    configureBindings();
    configureDefaultCommands();
  }
  
  private void configureDefaultCommands() {
    driveSubsystem.setDefaultCommand(
      new DriveCommand(
        driveSubsystem,
        () -> -driverController.getLeftY(),
        () -> -driverController.getRightX()
      )
    );
  }
  
  private void configureBindings() {
    new JoystickButton(driverController, XboxController.Button.kA.value)
      .whileTrue(new IntakeCommand(intakeSubsystem));
  }
  
  public Command getAutonomousCommand() {
    return new AutoCommand(driveSubsystem, intakeSubsystem);
  }
}

Git Yapısı:
.gitignore:
- build/
- bin/
- .gradle/
- *.class

Branch'ler:
- main: Yarışma hazır kod
- dev: Geliştirme
- feature/xyz: Yeni özellikler

Best Practices:
✅ Tüm magic number'ları Constants'a al
✅ Her subsystem bir dosya
✅ Command'ları küçük ve tek amaçlı tut
✅ RobotContainer'da tüm wiring'i yap
✅ Subsystem'da mutable state, command'da mantık
✅ NetworkTables ile telemetry yolla
✅ Simulation test yaz`,
    metadata: {
      category: "programming",
      topic: "code-structure",
      language: "java",
      difficulty: "beginner"
    }
  },

  // Popular Teams
  {
    id: "frc-team-254",
    content: `FRC Team 254 - The Cheesy Poofs:
FRC'nin en başarılı takımlarından biri. San Jose, California.

Başarıları:
- 3x World Champions (2011, 2014, 2017)
- 6x World Finalists
- 30+ Regional/District kazanması
- En yüksek Elo rating (1900+)

Güçlü Yönleri:
- Sürüş hassasiyeti: Worldclass drivers
- Mekanik tasarım: Robust ve güvenilir
- Software: Open source kod paylaşımı
- Strategy: Veri-odaklı karar alma

Açık Kaynak Katkıları:
- Cheesy Drive: Curvature drive algoritması
- Motion profiling libraries
- Vision processing code
- Robot code templates

2024 Crescendo Robot:
- Ultra-fast note cycling (<4 saniye)
- Precision shooter (90%+ accuracy)
- Reliable climber
- Strong defense capability

Notable Alumni:
Birçok mezun tech şirketlerinde (Google, Apple, Tesla)

GitHub: github.com/Team254
Website: team254.com
Chief Delphi: En aktif forum katılımcıları

Öğrenilebilecekler:
- Code organization
- Build quality standards
- Driver training metodları
- Strategic thinking

"Culture of excellence" ile tanınırlar`,
    metadata: {
      category: "teams",
      topic: "team-254",
      region: "california",
      difficulty: "reference"
    }
  },

  {
    id: "frc-team-1678",
    content: `FRC Team 1678 - Citrus Circuits:
Data analytics ve innovation ile tanınan elit FRC takımı. Davis, California.

Başarıları:
- 3x World Champions (2015, 2018, 2023)
- Innovation in Control Award (multiple)
- Engineering Inspiration Award
- 2023 Championship kazananı

Güçlü Yönleri:
- Scouting: En gelişmiş scouting sistemi
- Data Analytics: Real-time match prediction
- Autonomous: Karmaşık multi-piece auto rutinleri
- Consistency: Yüksek performans tekrarı

Scouting Sistemi:
- Custom Android app
- 50+ data points per match
- Real-time cloud sync
- Advanced analytics dashboard
- Pick list generation

Open Source Tools:
- Scouting app (Scout)
- Data analysis tools
- Strategy calculators

2023 Charged Up:
- World Championship kazandılar
- 3-piece auto + 2 cube teleop
- Perfect alliance selection

Tech Stack:
- Python: Data analysis
- Java: Robot code
- Kotlin: Android scouting app
- Cloud: Firebase/AWS

Website: citruscircuits.org
GitHub: github.com/frc1678

Öğrenilebilecekler:
- Scouting app development
- Data-driven strategy
- Alliance selection tactics
- Consistent performance

"Data wins matches" felsefesiyle çalışırlar`,
    metadata: {
      category: "teams",
      topic: "team-1678",
      region: "california",
      difficulty: "reference"
    }
  },

  // 2025 FRC Reefscape Game
  {
    id: "frc-2025-reefscape",
    content: `FRC 2025 Reefscape Oyun Stratejisi:
Reefscape, okyanus ve mercan resifleri temalı FRC 2025 oyunudur. Algae (yosun) ve Coral (mercan) game piece'leri vardır.

Game Pieces:
- Algae (Yosun): Yeşil, yumuşak foam objeler
- Coral (Mercan): Turuncu, sert plastik objeler
- Her ikisi de farklı skorlama alanlarına yerleştirilebilir

Skorlama Alanları:
- Processor: Ana skorlama bölgesi (L1: 3pt, L2: 6pt, L3: 9pt, L4: 12pt)
- Reef: Mercan yerleştirme (Barge: 4pt, Net: 6pt)
- Cage: Endgame tırmanma alanı (Low: 2pt, High: 6pt, Shallow Cage: 12pt, Deep Cage: 18pt)

Auto Stratejisi:
- Leave starting zone: 3pt
- 3-4 game piece auto: İyi sayılır
- Processor scoring: Yüksek risk, yüksek ödül
- Reef prefill: Stratejik pozisyonlama

Teleop Stratejisi:
- Fast cycling: <8 saniye ideal
- Processor leveling: L3-L4 hedefle
- Reef scoring: Barge farming stratejisi
- Defense: Opponent cycle'ını kes

Endgame (Son 20 saniye):
- Cage climbing: Shallow vs Deep decision
- 2-bot climb harmony: +10pt bonus
- Coral placement priority: Son saniye skorlama

Meta Stratejiler (2025):
- High-level processor bots: 12pt per cycle
- Reef specialists: Coral placement expertise
- Fast climbers: 20 saniye içinde deep cage
- Defensive bots: Cycling disruption

Robot Design Considerations:
- Dual intake: Algae + Coral esnekliği
- Elevator/Arm: Processor L4 reach
- Climber mechanism: Deep cage capability
- Vision: AprilTag + game piece detection

Popüler Stratejiler:
- 3-bot cycle + climb combo
- 2 cycler + 1 defense
- Reef control + processor scoring
- Fast auto + teleop dominance

Early Season Tips:
- Processor scoring zor, practice gerekli
- Reef scoring tutarlı, reliable strategy
- Climbing critical, son 20 saniye game-changer
- Defense effective ama risky

Alliance Selection:
- 1st pick: Reliable processor scorer
- 2nd pick: Climber + reef specialist
- 3rd pick: Defense/cycle hybrid

Önemli Kurallar:
- Coral limit per robot
- Contact rules (G-rules)
- Endgame zone restrictions
- Human player interactions

2025 Championship Predictions:
- Processor dominance meta
- Fast cycle times (<7s)
- Consistent deep cage climbs
- Strong auto routines (4+ pieces)`,
    metadata: {
      category: "game-strategy",
      topic: "reefscape-2025",
      year: 2025,
      difficulty: "intermediate"
    }
  },

  // Advanced Programming Concepts
  {
    id: "wpilib-advanced-controls",
    content: `WPILib Advanced Controls ve State Space:
Modern FRC robotları için gelişmiş kontrol teknikleri.

State Space Control:
State space, sistem dinamiklerini matematiksel olarak modeller.

Temel Kavramlar:
- State (Durum): Sistemin mevcut hali (pozisyon, hız)
- Input (Girdi): Motor voltajı, PWM sinyali
- Output (Çıktı): Encoder, gyro okumaları
- Model: Sistem davranışını tanımlayan denklemler

WPILib State Space Örneği (Java):
// Flywheel model
LinearSystem<N1, N1, N1> flywheelPlant = LinearSystemId.identifyVelocitySystem(
  kV, kA
);

LinearSystemLoop<N1, N1, N1> loop = new LinearSystemLoop<>(
  flywheelPlant,
  flywheelController,
  flywheelObserver,
  12.0, // Max voltage
  0.020 // Update rate (20ms)
);

// Her döngüde
loop.setNextR(VecBuilder.fill(desiredVelocity));
loop.correct(VecBuilder.fill(encoder.getRate()));
loop.predict(0.020);
motor.setVoltage(loop.getU(0));

Kalman Filter:
Sensor fusion için optimal estimator

KalmanFilter<N2, N1, N1> observer = new KalmanFilter<>(
  Nat.N2(), Nat.N1(),
  flywheelPlant,
  VecBuilder.fill(0.1, 0.1), // State std devs
  VecBuilder.fill(0.01),      // Measurement std devs
  0.020
);

LQR (Linear Quadratic Regulator):
Optimal kontrol için controller tasarımı

LinearQuadraticRegulator<N2, N1, N1> controller = 
  new LinearQuadraticRegulator<>(
    flywheelPlant,
    VecBuilder.fill(1.0, 1.0), // State costs
    VecBuilder.fill(1.0),       // Input costs
    0.020
  );

Feedforward Models:
- SimpleMotorFeedforward: kS + kV*v + kA*a
- ArmFeedforward: Motor + gravity
- ElevatorFeedforward: Motor + friction

System Identification (SysId):
Robot karakteristiklerini ölçme

1. WPILib SysId tool'u indir
2. Robot'a quasistatic ve dynamic testler yap
3. kS, kV, kA değerlerini al
4. Model'e uygula

Trajectory Generation:
TrajectoryGenerator.generateTrajectory(
  start,
  List.of(interiorWaypoints),
  end,
  config
);

Trajectory Following:
RamseteController + feedforward ile trajectory takibi

RamseteCommand command = new RamseteCommand(
  trajectory,
  drivetrain::getPose,
  new RamseteController(),
  feedforward,
  kinematics,
  drivetrain::setSpeeds,
  drivetrain
);

Motion Profiling:
TrapezoidProfile ile smooth hareket

TrapezoidProfile profile = new TrapezoidProfile(
  new Constraints(maxVelocity, maxAcceleration)
);

TrapezoidProfile.State setpoint = profile.calculate(
  dt,
  currentState,
  goalState
);

Avantajlar:
- Optimal kontrol
- Sensor fusion
- Predictable davranış
- Matematiksel garantiler

Kullanım Alanları:
- Swerve drive control
- Flywheel velocity control
- Arm position control
- Autonomous trajectory following

Team 254 ve 1678 gibi top team'ler bu teknikleri kullanır!

Dokümantasyon:
https://docs.wpilib.org/en/stable/docs/software/advanced-controls/state-space/index.html`,
    metadata: {
      category: "programming",
      topic: "advanced-controls",
      language: "java",
      difficulty: "advanced"
    }
  },

  // Robot Electrical Systems
  {
    id: "frc-electrical-systems",
    content: `FRC Robot Elektrik Sistemleri:
FRC robot'larının elektrik ve elektronik sistemleri rehberi.

Güç Dağıtımı:
- Battery: 12V FRC onaylı pil (18Ah tipik)
- Main Breaker: 120A ana devre kesici
- PDP/PDH: Power Distribution Panel/Hub
- Motor Controllers: Akım sınırlayıcılar

FRC Onaylı Bataryalar:
- Interstate Batteries DCS-33
- MK Battery ES17-12
- Enersys NP18-12
- ~18Ah capacity, ~12.6V tam şarj

Power Distribution Panel (PDP) - Legacy:
- 16x Wago connector (motor + misc)
- CAN bus monitoring
- Current monitoring per channel
- 12V robot power

Power Distribution Hub (PDH) - Modern (2022+):
- 20x motor channels (switchable)
- USB-C power
- Improved current monitoring
- Switched channels (software kontrol)

RoboRIO (Robot Controller):
- Main CPU: 667 MHz dual-core ARM Cortex-A9
- RAM: 256 MB
- Flash: 512 MB
- Ports: USB, Ethernet, CAN, DIO, Analog, PWM, Relay
- Voltage: 6-16V input (12V nominal)

Radio (OpenMesh OM5P-AN):
- 2.4/5 GHz dual-band
- FRC firmware required
- Robot-driver station iletişimi
- Network: 10.TE.AM.2 (örn: 10.25.4.2)

CAN Bus:
CAN (Controller Area Network) robot içi iletişim

Devices on CAN:
- Motor controllers (TalonFX, SparkMAX)
- PDH/PDP
- Pneumatic Control Module (PCM)
- CANivore (CTRE)

CAN Wiring:
- Twisted pair (Yellow/Green)
- Daisy chain topology
- 120Ω termination resistors (her iki uçta)
- Maksimum 40m toplam uzunluk

Pneumatics:
- Compressor: 120 PSI max
- PCM/PH: Pneumatic Control Module/Hub
- Solenoids: Single/double acting
- Pressure sensor: Monitoring
- Working pressure: 60 PSI regüle

Wiring Best Practices:
1. Kalın kablolar motorlara (10-12 AWG)
2. CAN twisted pair kullan
3. Kablo management (zip ties, velcro)
4. Connections sıkı (Anderson, Wago)
5. Breakers doğru boyut seç

Breaker Sizing:
- Drive motors: 40A
- Mechanism motors: 20-40A (motor'a göre)
- Accessories: 5-20A

Voltage Drop:
Uzun kablo = voltage drop = performans kaybı

Hesaplama:
Vdrop = 2 * I * R * L / 1000

Önleme:
- Kısa kablo kullan
- Kalın kablo kullan (düşük AWG)
- Yüksek akım yollarında özen

Common Electrical Issues:
- Loose connections: Intermittent problems
- Brownouts: Çok fazla akım çekimi
- CAN bus errors: Wiring veya termination
- Radio disconnects:간섭 veya power issues

Brownout Prevention:
- Current limiting (motor controllers)
- Stagger motor start (soft start)
- Battery health monitoring
- Voltage compensation

LED Indicators:
- RoboRIO: RSL (Robot Signal Light) - gerekli!
- Radio: Status LEDs
- PDH: Status LED
- Motor controllers: Status LEDs

Troubleshooting Tools:
- Multimeter: Voltage/continuity
- CAN analyzer: Bus debugging
- Driver Station logs: Error messages
- Phoenix Tuner / REV Hardware Client

Competition Inspection:
✅ Battery secured
✅ Main breaker accessible
✅ RSL visible ve çalışıyor
✅ All connections secure
✅ No exposed wire
✅ Proper wire gauges
✅ Bumpers wired correctly

Safety:
- Main breaker off during work
- No live circuit probing
- Proper fusing
- Team safety captain

Dokümantasyon:
https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-1/index.html`,
    metadata: {
      category: "electrical",
      topic: "power-systems",
      difficulty: "intermediate"
    }
  },

  // Build Season Best Practices
  {
    id: "frc-build-season-guide",
    content: `FRC Build Season En İyi Uygulamalar:
Kickoff'tan yarışmaya kadar 8 haftalık build season rehberi.

Build Season Timeline (8 hafta):

Week 0-1: Kickoff & Strategy
- Oyun kurallarını oku (tüm takım)
- Video analysis yap
- Brainstorming sessions
- Strategy document oluştur
- Prototype priorities belirle

Week 1-2: Prototyping
- Kritik mekanizmaları prototype et
- Farklı tasarımları test et
- Drive train seçimi
- Sensor testing
- Vendor parts sipariş et

Week 2-3: Design Finalization
- CAD modelini tamamla
- Bill of Materials (BOM) hazırla
- Parts sipariş et
- Manufacturing plan yap
- Weight budget oluştur

Week 3-4: Fabrication
- Chassis build
- Subsystem fabrication
- CNC işlemler
- 3D printing
- Assembly planning

Week 4-5: Assembly & Integration
- Robot assembly
- Electrical wiring
- Pneumatics
- Subsystem integration
- Initial testing

Week 5-6: Programming & Testing
- Subsystem testing
- TeleOp testing
- Autonomous development
- Driver practice başla
- Iterate & improve

Week 6-7: Refinement
- Bug fixes
- Performance optimization
- Reliability improvements
- Driver practice intensive
- Strategy refinement

Week 7-8: Competition Prep
- Practice matches
- Scouting app hazırla
- Pit organization
- Spare parts toplama
- Final inspection checklist

Team Roles & Organization:

Design Team:
- Lead designer
- CAD modelers
- Prototypers
- Manufacturing planners

Build Team:
- Fabricators (metal, wood)
- Machinists
- 3D printing operators
- Assemblers

Electrical Team:
- Wiring specialists
- Electronics testers
- CAN bus experts
- Safety officer

Programming Team:
- Subsystem programmers
- Autonomous developers
- Vision programmers
- Dashboard developers

Strategy Team:
- Game analysts
- Scouting coordinators
- Drive coaches
- Alliance selectors

Drive Team:
- Drivers (2)
- Operator/Manipulator (1)
- Coach (1)
- Human player (1)

Best Practices:

Design:
✅ KISS (Keep It Simple, Stupid)
✅ Build within weight budget (120 lbs)
✅ Consider manufacturability
✅ Redundancy for critical systems
✅ Easy maintenance access

Build:
✅ Quality > speed
✅ Double-check measurements
✅ Document build process
✅ Test as you build
✅ Keep workspace organized

Programming:
✅ Version control (Git)
✅ Code reviews
✅ Comment your code
✅ Test frequently
✅ Simulation testing

Testing:
✅ Incremental testing
✅ Document issues
✅ Driver feedback loops
✅ Competition conditions simulation
✅ Failure mode analysis

Common Mistakes to Avoid:
❌ Over-ambitious design
❌ Late vendor part orders
❌ Neglecting driver practice
❌ Poor weight management
❌ Skipping prototyping
❌ Last-minute programming
❌ Inadequate testing

Weight Management:
- Track weight weekly
- Budget: Chassis 40%, Mechanisms 35%, Electronics 15%, Bumpers 10%
- Weight reduction strategies
- Weigh before bagging/shipping

Tool & Resource Management:
- Tool checkout system
- Parts inventory
- Workspace cleanliness
- Safety equipment
- First aid kit

Mentor Roles:
- Technical guidance
- Safety oversight
- Schedule management
- Student empowerment
- Skill teaching

Communication:
- Daily stand-ups
- Weekly all-hands
- Subteam meetings
- Documentation (wiki, notebook)
- Slack/Discord

Gracious Professionalism:
- Help other teams
- Share knowledge
- Respect competitors
- Cooperate with officials
- Positive attitude

Week Bag/Ship Day:
- Final weight check
- Withholding allowance items
- Documentation
- Travel arrangements
- Pit setup plan

Success Metrics:
- Robot functionality (% working)
- Driver proficiency
- Team morale
- Learning outcomes
- Competition readiness

"A robot that works is better than a robot that's perfect but doesn't work!"`,
    metadata: {
      category: "team-management",
      topic: "build-season",
      difficulty: "beginner"
    }
  },

  // Computer Vision
  {
    id: "frc-computer-vision-photonvision",
    content: `FRC Computer Vision - PhotonVision:
PhotonVision, FRC için açık kaynak vision processing yazılımıdır.

PhotonVision Nedir?
- Orange Pi/Raspberry Pi üzerinde çalışır
- AprilTag tracking
- Reflective tape tracking
- Object detection
- Web-based configuration
- WPILib integration

Kurulum:
1. Orange Pi/Raspberry Pi hazırla
2. PhotonVision image flash et
3. Camera takın (USB veya CSI)
4. Network configuration yap (10.TE.AM.11)
5. Web UI'ye eriş (http://photonvision.local)

AprilTag Tracking:
AprilTags, robot localization için fiducial marker'lardır.

PhotonVision AprilTag Kullanımı (Java):
PhotonCamera camera = new PhotonCamera("cameraName");

PhotonPipelineResult result = camera.getLatestResult();

if (result.hasTargets()) {
  PhotonTrackedTarget target = result.getBestTarget();
  
  // Target bilgileri
  double yaw = target.getYaw();
  double pitch = target.getPitch();
  double area = target.getArea();
  int fiducialId = target.getFiducialId();
  
  // 3D pose estimation
  Transform3d camToTarget = target.getBestCameraToTarget();
}

Robot Pose Estimation:
PhotonPoseEstimator estimator = new PhotonPoseEstimator(
  aprilTagFieldLayout,
  PoseStrategy.MULTI_TAG_PNP,
  camera,
  robotToCam
);

Optional<EstimatedRobotPose> result = estimator.update();
if (result.isPresent()) {
  Pose2d estimatedPose = result.get().estimatedPose.toPose2d();
  // Pose'u odometry'ye fuse et
  drivetrain.addVisionMeasurement(
    estimatedPose,
    result.get().timestampSeconds
  );
}

Pipeline Configuration:
- 3D mode: AprilTag, SolvePNP
- Reflective mode: Contour tracking
- Input resolution: 640x480, 1280x720
- Exposure: Manuel (vision için)
- Brightness threshold

Camera Placement:
- Yüksek FPS kamera (30-60 fps)
- Robot center yakınında
- Geniş FOV lens
- Stable mounting (titreşim minimize)
- AprilTags görüş açısında

Auto-Aim Example:
public class AutoAimCommand extends CommandBase {
  private final DriveSubsystem drive;
  private final PhotonCamera camera;
  private final PIDController rotController;
  
  public void execute() {
    var result = camera.getLatestResult();
    
    if (result.hasTargets()) {
      double yaw = result.getBestTarget().getYaw();
      double rotSpeed = rotController.calculate(yaw, 0);
      drive.arcadeDrive(0, rotSpeed);
    }
  }
  
  public boolean isFinished() {
    return Math.abs(rotController.getPositionError()) < 2.0;
  }
}

Multi-Camera Setup:
- Front camera: AprilTag tracking
- Back camera: Defensive awareness
- Game piece camera: Object detection

NetworkTables Integration:
PhotonVision NetworkTables'a yayın yapar

SmartDashboard.putBoolean("Has Target", result.hasTargets());
SmartDashboard.putNumber("Target Yaw", result.getBestTarget().getYaw());

Simulation Support:
PhotonVision sim desteği var

PhotonCameraSim cameraSim = new PhotonCameraSim(camera);
VisionSystemSim visionSim = new VisionSystemSim("main");
visionSim.addCamera(cameraSim, robotToCam);

Performance Tips:
- Resolution düşür (processing speed için)
- Pipeline optimize et
- Multi-threading kullan
- Orange Pi 5 tercih et (güçlü)

2024-2025 Vision Trends:
- AprilTag dominant
- Neural network object detection
- Real-time pose estimation
- Multi-tag triangulation

Dokümantasyon:
https://docs.photonvision.org/`,
    metadata: {
      category: "vision",
      topic: "photonvision",
      language: "java",
      difficulty: "advanced"
    }
  },

  // Competition Day Guide
  {
    id: "frc-competition-day-guide",
    content: `FRC Yarışma Günü Rehberi:
Competition day hazırlık ve stratejileri.

Yarışma Öncesi (1 hafta):

Pre-Competition Checklist:
✅ Robot fully tested ve çalışıyor
✅ Spare parts hazır (motors, belts, fasteners)
✅ Tool kit tamamlanmış
✅ Battery pack (6+ şarjlı batarya)
✅ Scouting app/system hazır
✅ Strategy oyun planları
✅ Driver practice tamamlanmış
✅ Pit layout planlanmış
✅ Safety gear (goggles, gloves)
✅ Team apparel

Competition Day Schedule:

6:00 AM - Doors Open:
- Pit setup
- Robot inspection
- Battery charging başla
- Team meeting

8:00 AM - Practice Matches:
- Robot calibration
- Autonomous testing
- Driver warm-up
- Strategy adjustments

10:00 AM - Opening Ceremony:
- Team attendance
- Safety briefing
- Schedule review

11:00 AM - Qualification Matches:
- ~10-12 matches per team
- Match every 1-2 saat
- Between matches: repairs, adjustments

5:00 PM - Alliance Selection:
- Top 8 teams pick alliances
- Strategy crucial
- Accept/decline decisions

6:00 PM - Playoff Matches:
- Best-of-3 elimination
- Quarterfinals → Semifinals → Finals

8:00 PM - Awards Ceremony:
- Team awards
- Individual awards
- Championship announced

Match Cycle (20 dakika):

0:00 - Queue:
- 3 matches önceden queue'ya git
- Pre-match checklist (battery, bumpers)
- Driver station setup

0:05 - Field:
- Robot field'a taşın
- Connections (power, DS)
- Field check (bumpers, violations)

0:10 - Match Start:
- 15s auto → 2:15 teleop → endgame
- Coach strategy calls
- Human player coordination

0:13 - Match End:
- Robot disable
- Disconnect ve field'dan çık
- Quick damage assessment

0:15 - Pit Return:
- Battery değiştir
- Quick repairs (if needed)
- Data logging/review

0:20 - Next Cycle:
- Prep for next match
- Scouting review
- Strategy adjust

Pit Crew Roles:

Drive Team (on field):
- Driver 1: Primary control
- Driver 2: Secondary/Manipulator
- Coach: Strategy calls
- Human Player: Game piece loading

Pit Crew (in pit):
- Pit Lead: Coordination
- Mechanical: Repairs
- Electrical: Diagnostics
- Programming: Bug fixes
- Battery Manager: Charging schedule
- Scouters: Data collection

Match Strategy:

Pre-Match:
- Alliance meeting (30s in queue)
- Autonomous coordination
- Role assignments
- Backup plans

Auto Phase (15s):
- Pre-programmed routine
- Reliable > risky
- Communicate start position

Teleop (2:15):
- Execute game plan
- Communicate constantly
- Adapt to field conditions
- Track time

Endgame (last 20-30s):
- Climb coordination
- Final scoring push
- Timer awareness

Scouting System:

Data to Collect:
- Auto performance (pieces, mobility)
- Teleop cycles (count, accuracy)
- Endgame (climb success, points)
- Defense rating
- Reliability (breakdowns)
- Driver skill

Analysis:
- OPR (Offensive Power Rating)
- Alliance compatibility
- Pick list generation
- Match predictions

Alliance Selection Strategy:

Captain Role (Top 8):
- Pick complementary robot
- Balance offense/defense
- Reliability over peak performance
- Chemistry matters

Pick List Preparation:
1. Create ranked list (20+ teams)
2. Categorize by role (scorer, defense, climber)
3. Scout verify
4. Backup options

Being Picked:
- Robot showcase (between matches)
- Network with captains
- Highlight strengths
- Be gracious

Common Competition Issues:

Technical:
- Battery low: Swap immediately
- Brownout: Reduce current draw
- Radio disconnect: Check cable, power cycle
- CAN bus error: Check wiring, restart roboRIO
- Motor failure: Swap motor if time allows

Operational:
- Match no-show: Yellow card
- Late to field: Queue earlier
- Rule violation: Know rules
- Robot damage: Triage priority

Emergency Repairs:
- Assess: 2 minutes
- Fix or workaround: 10 minutes
- Test: 3 minutes
- Total: 15-20 min between matches

Pit Etiquette:
✅ Keep pit organized
✅ Battery charging safe
✅ Tools secured
✅ Help other teams
✅ Gracious professionalism
✅ Respect inspectors

Competition Tips:
1. Stay hydrated ve rested
2. Communicate clearly
3. Keep calm under pressure
4. Learn from every match
5. Network with other teams
6. Document everything
7. Have fun!

Post-Match Debrief:
- What worked?
- What broke?
- Strategy adjustments?
- Scouting insights?
- Next match prep

Awards to Aim For:
- Engineering Inspiration
- Creativity Award
- Industrial Design
- Quality Award
- Safety Award
- Imagery Award
- Team Spirit Award

"Competition is where all the hard work pays off. Stay focused, stay positive, and have an amazing time!"`,
    metadata: {
      category: "competition",
      topic: "competition-day",
      difficulty: "beginner"
    }
  }
];

