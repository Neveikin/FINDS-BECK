package com.Finds.dev.DTO.Auth;

import com.Finds.dev.Entity.User;

public class UserProfileDto {
    private String id;
    private String email;
    private String name;
    private User.UserRole role;
    private String firstName;
    private String lastName;
    private String birthDate;
    private String gender;
    private String city;
    private String street;
    private String house;
    private String phone;
    private String createdAt;

    public UserProfileDto() {
    }

    public UserProfileDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.role = user.getRole();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.birthDate = user.getBirthDate();
        this.gender = user.getGender();
        this.city = user.getCity();
        this.street = user.getStreet();
        this.house = user.getHouse();
        this.phone = user.getPhone();
        this.createdAt = user.getCreatedAt() != null ? user.getCreatedAt().toString() : null;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public User.UserRole getRole() {
        return role;
    }

    public void setRole(User.UserRole role) {
        this.role = role;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getBirthDate() { return birthDate; }
    public void setBirthDate(String birthDate) { this.birthDate = birthDate; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getHouse() { return house; }
    public void setHouse(String house) { this.house = house; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
