from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import random
from .. import models, database
from . import auth  # <--- FIXED

router = APIRouter(tags=["Typing"])

# --- EXPANDED CONTENT ENGINE ---
AI_TEXTS = [
    "Artificial intelligence is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans.",
    "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation.",
    "FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.6+ based on standard Python type hints.",
    "React is a free and open-source front-end JavaScript library for building user interfaces based on UI components.",
    "Machine learning algorithms build a model based on sample data, known as training data, in order to make predictions or decisions without being explicitly programmed to do so.",
    "The history of AI began in antiquity, with myths, stories and rumors of artificial beings endowed with intelligence or consciousness by master craftsmen.",
    "Deep learning is part of a broader family of machine learning methods based on artificial neural networks with representation learning.",
    "Natural language processing (NLP) is a subfield of linguistics, computer science, and artificial intelligence concerned with the interactions between computers and human language.",
    "Computer vision is an interdisciplinary scientific field that deals with how computers can be made to gain high-level understanding from digital images or videos.",
    "Robotics is an interdisciplinary branch of computer science and engineering. Robotics involves design, construction, operation, and use of robots.",
    "The Turing test, originally called the imitation game by Alan Turing in 1950, is a test of a machine's ability to exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human.",
    "Supervised learning is the machine learning task of learning a function that maps an input to an output based on example input-output pairs.",
    "Unsupervised learning is a type of machine learning that looks for previously undetected patterns in a data set with no pre-existing labels and with a minimum of human supervision.",
    "Reinforcement learning is an area of machine learning concerned with how intelligent agents ought to take actions in an environment in order to maximize the notion of cumulative reward.",
    "Big data is a field that treats ways to analyze, systematically extract information from, or otherwise deal with data sets that are too large or complex to be dealt with by traditional data-processing application software.",
    "Cloud computing is the on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user.",
    "The Internet of things describes the network of physical objects—things—that are embedded with sensors, software, and other technologies for the purpose of connecting and exchanging data with other devices and systems over the Internet.",
    "Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks.",
    "Blockchain is a growing list of records, called blocks, that are linked using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.",
    "Quantum computing is the use of quantum phenomena such as superposition and entanglement to perform computation.",
    "A neural network is a network or circuit of neurons, or in a modern sense, an artificial neural network, composed of artificial neurons or nodes.",
    "Data science is an interdisciplinary field that uses scientific methods, processes, algorithms and systems to extract knowledge and insights from noisy, structured and unstructured data.",
    "Algorithm is a finite sequence of well-defined, computer-implementable instructions, typically to solve a class of problems or to perform a computation.",
    "Software engineering is the systematic application of engineering approaches to the development of software.",
    "Full-stack development refers to the development of both front end (client side) and back end (server side) portions of web application.",
    "API stands for Application Programming Interface, which is a software intermediary that allows two applications to talk to each other.",
    "Database is an organized collection of data, generally stored and accessed electronically from a computer system.",
    "SQL is a domain-specific language used in programming and designed for managing data held in a relational database management system.",
    "NoSQL databases are increasingly used in big data and real-time web applications. NoSQL systems are also sometimes called 'Not only SQL' to emphasize that they may support SQL-like query languages.",
    "DevOps is a set of practices that combines software development (Dev) and IT operations (Ops). It aims to shorten the systems development life cycle and provide continuous delivery with high software quality.",
    "Agile software development is an approach to software development under which requirements and solutions evolve through the collaborative effort of self-organizing and cross-functional teams and their customer/end user.",
    "Git is a distributed version-control system for tracking changes in source code during software development.",
    "Docker is a set of platform as a service products that use OS-level virtualization to deliver software in packages called containers.",
    "Kubernetes is an open-source container-orchestration system for automating computer application deployment, scaling, and management.",
    "Linux is a family of open-source Unix-like operating systems based on the Linux kernel, an operating system kernel first released on September 17, 1991, by Linus Torvalds.",
    "Open source software is computer software that is released under a license in which the copyright holder grants users the rights to use, study, change, and distribute the software and its source code to anyone and for any purpose.",
    "Virtual reality is a simulated experience that can be similar to or completely different from the real world.",
    "Augmented reality is an interactive experience of a real-world environment where the objects that reside in the real world are enhanced by computer-generated perceptual information.",
    "The World Wide Web, commonly known as the Web, is an information system where documents and other web resources are identified by Uniform Resource Locators.",
    "HTML is the standard markup language for documents designed to be displayed in a web browser.",
    "CSS is a style sheet language used for describing the presentation of a document written in a markup language such as HTML.",
    "JavaScript is a programming language that conforms to the ECMAScript specification.",
    "TypeScript is a programming language developed and maintained by Microsoft. It is a strict syntactical superset of JavaScript and adds optional static typing to the language.",
    "Node.js is an open-source, cross-platform, back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser.",
    "Django is a Python-based free and open-source web framework that follows the model–template–views architectural pattern.",
    "Flask is a micro web framework written in Python. It is classified as a microframework because it does not require particular tools or libraries.",
    "Spring Boot is an open source Java-based framework used to create a micro Service.",
    "Android is a mobile operating system based on a modified version of the Linux kernel and other open source software, designed primarily for touchscreen mobile devices such as smartphones and tablets.",
    "iOS is a mobile operating system created and developed by Apple Inc. exclusively for its hardware.",
    "Swift is a general-purpose, multi-paradigm, compiled programming language developed by Apple Inc. and the open-source community.",
    "Kotlin is a cross-platform, statically typed, general-purpose programming language with type inference. Kotlin is designed to interoperate fully with Java.",
    "Go is a statically typed, compiled programming language designed at Google by Robert Griesemer, Rob Pike, and Ken Thompson.",
    "Rust is a multi-paradigm, general-purpose programming language designed for performance and safety, especially safe concurrency.",
    "C++ is a general-purpose programming language created by Bjarne Stroustrup as an extension of the C programming language, or 'C with Classes'.",
    "C# is a general-purpose, multi-paradigm programming language encompassing strong typing, lexically scoped, imperative, declarative, functional, generic, object-oriented, and component-oriented programming disciplines.",
    "Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible.",
    "Ruby is an interpreted, high-level, general-purpose programming language.",
    "PHP is a general-purpose scripting language especially suited to web development.",
    "Perl is a family of two high-level, general-purpose, interpreted, dynamic programming languages.",
    "R is a programming language and free software environment for statistical computing and graphics supported by the R Core Team and the R Foundation for Statistical Computing.",
    "MATLAB is a proprietary multi-paradigm programming language and numeric computing environment developed by MathWorks.",
    "Scala is a strong statically typed general-purpose programming language which supports both object-oriented programming and functional programming.",
    "Haskell is a general-purpose, statically typed, purely functional programming language with type inference and lazy evaluation.",
    "Lisp is a family of computer programming languages with a long history and a distinctive, fully parenthesized prefix notation.",
    "Prolog is a logic programming language associated with artificial intelligence and computational linguistics.",
    "Assembly language is any low-level programming language in which there is a very strong correspondence between the instructions in the language and the architecture's machine code instructions.",
    "Binary code represents text, computer processor instructions, or any other data using a two-symbol system.",
    "Hexadecimal is a positional system that represents numbers using a radix (base) of 16.",
    "ASCII is a character encoding standard for electronic communication. ASCII codes represent text in computers, telecommunications equipment, and other devices.",
    "Unicode is an information technology standard for the consistent encoding, representation, and handling of text expressed in most of the world's writing systems.",
    "TCP/IP is a suite of communication protocols used to interconnect network devices on the internet.",
    "HTTP is an application layer protocol for distributed, collaborative, hypermedia information systems.",
    "HTTPS is an extension of the Hypertext Transfer Protocol. It is used for secure communication over a computer network, and is widely used on the Internet.",
    "DNS is a hierarchical and decentralized naming system for computers, services, or other resources connected to the Internet or a private network.",
    "IP address is a numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication.",
    "VPN extends a private network across a public network and enables users to send and receive data across shared or public networks as if their computing devices were directly connected to the private network.",
    "Firewall is a network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules.",
    "Encryption is the process of encoding information. This process converts the original representation of the information, known as plaintext, into an alternative form known as ciphertext.",
    "Decryption is the process of transforming data that has been rendered unreadable through encryption back to its unencrypted form.",
    "Hacking is the act of compromising digital devices and networks to gain unauthorized access to an entire system or its data.",
    "Phishing is a type of social engineering where an attacker sends a fraudulent message designed to trick a human victim into revealing sensitive information.",
    "Malware is any software intentionally designed to cause disruption to a computer, server, client, or computer network, leak private information, gain unauthorized access to information or deprive access to information, or otherwise interfere with the user's computer security and privacy.",
    "Virus is a type of computer program that, when executed, replicates itself by modifying other computer programs and inserting its own code.",
    "Trojan horse is any malware which misleads users of its true intent.",
    "Ransomware is a type of malware from cryptovirology that threatens to publish the victim's data or perpetually block access to it unless a ransom is paid.",
    "Spyware is software with malicious behavior that aims to gather information about a person or organization and send it to another entity in a way that harms the user.",
    "Adware is software that generates revenue for its developer by automatically generating online advertisements in the user interface of the software or on a screen presented to the user during the installation process.",
    "Botnet is a number of Internet-connected devices, each of which is running one or more bots. Botnets can be used to perform distributed denial-of-service attack, steal data, send spam, and allows the attacker to access the device and its connection.",
    "DDoS attack is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to the Internet.",
    "Zero-day vulnerability is a computer-software vulnerability that is unknown to those who should be interested in mitigating the vulnerability.",
    "OpenAI is an artificial intelligence research laboratory consisting of the for-profit corporation OpenAI LP and its parent company, the non-profit OpenAI Inc.",
    "Google is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, a search engine, cloud computing, software, and hardware.",
    "Microsoft is an American multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services.",
    "Apple is an American multinational technology company that specializes in consumer electronics, computer software, and online services.",
    "Amazon is an American multinational technology company which focuses on e-commerce, cloud computing, digital streaming, and artificial intelligence.",
    "Facebook is an American online social media and social networking service owned by Meta Platforms.",
    "Twitter is an American microblogging and social networking service on which users post and interact with messages known as 'tweets'.",
    "LinkedIn is an American business and employment-oriented online service that operates via websites and mobile apps.",
    "Instagram is an American photo and video sharing social networking service created by Kevin Systrom and Mike Krieger.",
    "YouTube is an American online video sharing and social media platform owned by Google.",
    "Netflix is an American subscription streaming service and production company.",
    "Spotify is a proprietary Swedish audio streaming and media services provider.",
    "Tesla is an American electric vehicle and clean energy company.",
    "SpaceX is an American aerospace manufacturer, space transportation services and communications corporation."
]

class TestResultBase(BaseModel):
    wpm: float
    accuracy: float
    error_rate: float
    duration: int

@router.get("/generate-text")
def generate_text():
    """Returns a random paragraph for the user to type."""
    selected_text = random.choice(AI_TEXTS)
    return {"text": selected_text}

@router.post("/submit-test")
def submit_test(result: TestResultBase, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_test = models.TypingTest(
        user_id=current_user.id,
        wpm=result.wpm,
        accuracy=result.accuracy,
        error_rate=result.error_rate,
        duration=result.duration
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return {"message": "Test saved successfully!", "id": new_test.id}